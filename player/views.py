from django.shortcuts import render, redirect
from django.contrib import messages
from django.conf import settings
from django.http import Http404
import uuid
import zipfile
from pathlib import Path
import shutil
from urllib.parse import quote

# Código de acesso padrão
CODIGO_CORRETO = "ORC/DDAE-11.25"


def login_view(request):
    """View para a página de login"""
    # Se já está logado, redireciona para o player
    if request.session.get('magPlayerLogado'):
        return redirect('player')
    
    if request.method == 'POST':
        codigo = request.POST.get('codigo', '')
        
        if codigo == CODIGO_CORRETO:
            # Login bem-sucedido
            request.session['magPlayerLogado'] = True
            return redirect('player')
        else:
            # Código incorreto
            messages.error(request, 'Código incorreto. Tente novamente.')
    
    return render(request, 'player/login.html')


def player_view(request):
    """View para a página do player"""
    # Verificar se está logado
    if not request.session.get('magPlayerLogado'):
        return redirect('login')
    return render(request, 'player/player.html', {"initial": None, "debug": settings.DEBUG})


def _safe_extract_mag(file_obj, base_output_dir: Path) -> tuple[str, Path]:
    """
    Extrai um arquivo .mag (zip) em um diretório único dentro de base_output_dir.
    Retorna (pkg_id, output_dir). Somente extrai as pastas Depoimento/ e Arquivos/.
    """
    pkg_id = uuid.uuid4().hex
    out_dir = base_output_dir / pkg_id
    depo_dir = out_dir / 'Depoimento'
    arq_dir = out_dir / 'Arquivos'
    depo_dir.mkdir(parents=True, exist_ok=True)
    arq_dir.mkdir(parents=True, exist_ok=True)
    # Limites e extensões aceitas para minimizar I/O e evitar zip-bomb
    CHUNK_SIZE = 1024 * 1024  # 1MB
    MAX_PACKAGE_BYTES = getattr(settings, 'MAG_MAX_PACKAGE_BYTES', 300 * 1024 * 1024)  # 300MB
    MAX_FILE_BYTES = getattr(settings, 'MAG_MAX_FILE_BYTES', 100 * 1024 * 1024)  # 100MB por arquivo
    ALLOWED_EXTS = {'.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.oga', '.md', '.markdown'}

    try:
        with zipfile.ZipFile(file_obj) as z:
            # Filtra apenas entradas sob Arquivos/ ou Depoimento/
            candidates: list[zipfile.ZipInfo] = []
            total_uncompressed = 0
            for info in z.infolist():
                name = info.filename.replace('\\', '/')
                lower = name.lower()
                # pula diretórios
                if name.endswith('/'):
                    continue
                # mantém apenas dentro de pastas alvo
                if not (lower.startswith('depoimento/') or lower.startswith('arquivos/')):
                    continue
                # restringe por extensão
                ext = Path(name).suffix.lower()
                if ext and ext not in ALLOWED_EXTS:
                    continue
                # ignora entradas sem tamanho válido (defensivo)
                if info.file_size is None:
                    continue
                # limite por arquivo
                if info.file_size > MAX_FILE_BYTES:
                    continue
                candidates.append(info)
                total_uncompressed += int(info.file_size or 0)

            # Checa espaço disponível e tamanho total estimado
            try:
                usage = shutil.disk_usage(str(base_output_dir))
                free_bytes = usage.free
            except Exception:
                # fallback conservador se não for possível medir
                free_bytes = MAX_PACKAGE_BYTES

            if total_uncompressed > MAX_PACKAGE_BYTES:
                raise OSError(122, 'Pacote excede limite configurado para extração')
            if total_uncompressed > free_bytes * 0.9:  # mantém folga de 10%
                raise OSError(122, 'Espaço em disco insuficiente para extrair o pacote')

            # Extração com cópia em chunks e verificação de path traversal
            bytes_written = 0
            for info in candidates:
                name = info.filename.replace('\\', '/')
                lower = name.lower()

                target_path = None
                target_base = None
                if lower.startswith('depoimento/'):
                    relative_path = name.split('/', 1)[1] if '/' in name else ''
                    if relative_path:
                        target_path = (depo_dir / relative_path).resolve()
                        target_base = depo_dir
                elif lower.startswith('arquivos/'):
                    relative_path = name.split('/', 1)[1] if '/' in name else ''
                    if relative_path:
                        target_path = (arq_dir / relative_path).resolve()
                        target_base = arq_dir

                if not target_path or not target_base:
                    continue
                if not str(target_path).startswith(str(target_base.resolve())):
                    continue

                target_path.parent.mkdir(parents=True, exist_ok=True)
                written_for_file = 0
                with z.open(info) as src, open(target_path, 'wb') as dst:
                    while True:
                        chunk = src.read(CHUNK_SIZE)
                        if not chunk:
                            break
                        dst.write(chunk)
                        written_for_file += len(chunk)
                        bytes_written += len(chunk)
                        # aborta se ultrapassar qualquer limite (defensivo)
                        if written_for_file > MAX_FILE_BYTES or bytes_written > MAX_PACKAGE_BYTES:
                            raise OSError(122, 'Limite de tamanho excedido durante a extração')

    except Exception:
        # Em qualquer falha, remove diretório parcialmente extraído (best-effort)
        try:
            if out_dir.exists():
                shutil.rmtree(out_dir, ignore_errors=True)
        except Exception:
            pass
        raise

    return pkg_id, out_dir


def _list_audio_files(directory: Path) -> list[Path]:
    exts = {'.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.oga'}
    if not directory.exists():
        return []
    return sorted([p for p in directory.rglob('*') if p.suffix.lower() in exts])


def _list_markdown_files(directory: Path) -> list[Path]:
    if not directory.exists():
        return []
    return sorted([p for p in directory.rglob('*') if p.suffix.lower() in {'.md', '.markdown'}])


def upload_mag(request):
    """Recebe um .mag (zip), extrai e redireciona para o player com o pacote."""
    if not request.session.get('magPlayerLogado'):
        return redirect('login')

    if request.method != 'POST':
        return redirect('player')

    mag_file = request.FILES.get('magFile')
    if not mag_file:
        messages.error(request, 'Envie um arquivo .mag')
        return redirect('player')

    filename = mag_file.name.lower()
    if not (filename.endswith('.mag') or filename.endswith('.zip')):
        messages.error(request, 'Arquivo inválido. Envie um .mag')
        return redirect('player')

    base_output = Path(settings.MEDIA_ROOT) / 'packages'
    base_output.mkdir(parents=True, exist_ok=True)

    try:
        pkg_id, out_dir = _safe_extract_mag(mag_file, base_output)
    except zipfile.BadZipFile:
        messages.error(request, 'Arquivo corrompido ou não é um ZIP válido.')
        return redirect('player')
    except OSError as e:
        if getattr(e, 'errno', None) == 122:
            messages.error(
                request,
                'Falha no upload: espaço em disco insuficiente no servidor. '
                'Exclua pacotes antigos ou reduza o tamanho do .mag.'
            )
        else:
            messages.error(request, f'Falha ao processar o arquivo: {e}')
        return redirect('player')

    # Redireciona para o player com o pacote
    return redirect('player_with_package', pkg_id=pkg_id)


def player_with_package(request, pkg_id: str):
    if not request.session.get('magPlayerLogado'):
        return redirect('login')

    pkg_dir = (Path(settings.MEDIA_ROOT) / 'packages' / pkg_id)
    if not pkg_dir.exists():
        raise Http404('Pacote não encontrado')

    # Player: busca APENAS áudios de Depoimento/
    depo_dir = pkg_dir / 'Depoimento'
    audios = _list_audio_files(depo_dir)
    tracks = []
    initial_audio_url = None
    initial_audio_title = None
    if audios:
        for p in audios:
            relp = p.relative_to(Path(settings.MEDIA_ROOT))
            urlp = settings.MEDIA_URL.rstrip('/') + '/' + quote(str(relp).replace('\\', '/'))
            tracks.append({'name': p.name, 'url': urlp})
        # Usa o primeiro áudio encontrado como inicial
        initial_audio_url = tracks[0]['url']
        initial_audio_title = tracks[0]['name']

    context = {
        'pkg_id': pkg_id,
        'initial': {
            'audio_url': initial_audio_url,
            'title': initial_audio_title,
        },
        'tracks': tracks,
        'debug': settings.DEBUG,
    }
    return render(request, 'player/player.html', context)


def arquivos_view(request, pkg_id: str):
    if not request.session.get('magPlayerLogado'):
        return redirect('login')

    pkg_dir = (Path(settings.MEDIA_ROOT) / 'packages' / pkg_id)
    if not pkg_dir.exists():
        raise Http404('Pacote não encontrado')

    arq_dir = pkg_dir / 'Arquivos'
    depo_dir = pkg_dir / 'Depoimento'
    
    # Arquivos: coleta áudios de QUALQUER pasta (Arquivos/ e Depoimento/)
    audio_files_arq = _list_audio_files(arq_dir)
    audio_files_depo = _list_audio_files(depo_dir)
    audio_files = audio_files_arq + audio_files_depo
    
    # Markdowns apenas de Arquivos/
    md_files = _list_markdown_files(arq_dir)

    # Render markdowns (requere pacote 'markdown')
    rendered_markdowns = []
    try:
        import markdown as md
        for p in md_files:
            content = p.read_text(encoding='utf-8', errors='ignore')
            html = md.markdown(
                content, 
                extensions=[
                    'extra',           # Tabelas, definições, abreviações, etc
                    'nl2br',           # Quebras de linha automáticas
                    'sane_lists',      # Listas mais inteligentes
                ]
            )
            rendered_markdowns.append({'name': p.name, 'html': html})
    except ImportError:
        # Se markdown não está instalado, mostra como texto formatado
        for p in md_files:
            content = p.read_text(encoding='utf-8', errors='ignore')
            # Mantém quebras de linha e escapa HTML
            formatted = content.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('\n', '<br>')
            rendered_markdowns.append({'name': p.name, 'html': f'<div style="white-space:pre-wrap;">{formatted}</div>'})
    except Exception:
        # Outro erro, mostra como texto formatado
        for p in md_files:
            content = p.read_text(encoding='utf-8', errors='ignore')
            formatted = content.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('\n', '<br>')
            rendered_markdowns.append({'name': p.name, 'html': f'<div style="white-space:pre-wrap;">{formatted}</div>'})

    audio_urls = []
    for p in audio_files:
        rel = p.relative_to(Path(settings.MEDIA_ROOT))
        url = settings.MEDIA_URL.rstrip('/') + '/' + quote(str(rel).replace('\\', '/'))
        audio_urls.append({'name': p.name, 'url': url})

    context = {
        'pkg_id': pkg_id,
        'audio_files': audio_urls,
        'markdowns': rendered_markdowns,
        'debug': settings.DEBUG,
    }
    return render(request, 'player/arquivos.html', context)


def logout_view(request):
    """View para logout"""
    # Limpar a sessão
    if 'magPlayerLogado' in request.session:
        del request.session['magPlayerLogado']
    
    messages.info(request, 'Você saiu com sucesso.')
    return redirect('login')
