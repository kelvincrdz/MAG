from __future__ import annotations
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
import zipfile
import os

from .config import settings
from .database import Base, engine, get_db
from . import models, schemas, auth
from .utils_mag import is_audio, is_markdown, extract_markdown_title, detect_references

app = FastAPI(title=settings.app_name)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Criar tabelas
Base.metadata.create_all(bind=engine)

# Garantir diretórios de storage
storage_dir = Path(settings.storage_dir)
audio_dir = storage_dir / settings.audio_dir_name
audio_dir.mkdir(parents=True, exist_ok=True)

# Seed inicial baseado nos códigos fixos (pode ser expandido depois)
INITIAL_USERS = {
    'ORC/DDAE-11.25': {
        'nome': 'Magno Oliveira',
        'email': 'magno@ifce.edu.br',
        'departamento': 'DDAE',
        'perfil': 'Professor'
    },
    'ADM/COORD-01.25': {
        'nome': 'Maria Silva',
        'email': 'maria.silva@ifce.edu.br',
        'departamento': 'Coordenação',
        'perfil': 'Coordenador'
    },
    'TEC/LAB-05.25': {
        'nome': 'João Santos',
        'email': 'joao.santos@ifce.edu.br',
        'departamento': 'Laboratório',
        'perfil': 'Técnico'
    },
    'EST/INFO-10.25': {
        'nome': 'Ana Costa',
        'email': 'ana.costa@aluno.ifce.edu.br',
        'departamento': 'Informática',
        'perfil': 'Estudante'
    },
    'DOC/BIB-03.25': {
        'nome': 'Carlos Mendes',
        'email': 'carlos.mendes@ifce.edu.br',
        'departamento': 'Biblioteca',
        'perfil': 'Bibliotecário'
    }
}

# Seed function
@app.on_event("startup")
def seed_users():
    db = next(get_db())
    try:
        for codigo, data in INITIAL_USERS.items():
            exists = db.query(models.User).filter(models.User.codigo == codigo).first()
            if not exists:
                user = models.User(
                    codigo=codigo,
                    nome=data['nome'],
                    email=data['email'],
                    departamento=data['departamento'],
                    perfil=data['perfil']
                )
                db.add(user)
        db.commit()
    finally:
        db.close()

# Auth
@app.post('/auth/login', response_model=schemas.Token)
def login(req: schemas.LoginRequest, db: Session = Depends(get_db)):
    codigo = req.codigo.upper().strip()
    user = db.query(models.User).filter(models.User.codigo == codigo, models.User.is_active == 1).first()
    if not user:
        raise HTTPException(status_code=400, detail='Código incorreto')
    token = auth.create_access_token({'codigo': user.codigo})
    return schemas.Token(access_token=token, user=user)

# Users
@app.get('/users/me', response_model=schemas.UserOut)
def me(current=Depends(auth.get_current_user)):
    return current

# Processar .mag
@app.post('/mags/process', response_model=schemas.MagProcessResult)
def process_mag(file: UploadFile = File(...), db: Session = Depends(get_db), current=Depends(auth.get_current_user)):
    if not file.filename.lower().endswith('.mag'):
        raise HTTPException(status_code=400, detail='Arquivo deve ser .mag')

    # Salva temporariamente
    tmp_path = storage_dir / f"tmp_{file.filename}"
    with open(tmp_path, 'wb') as f:
        shutil.copyfileobj(file.file, f)

    # Abre ZIP
    try:
        with zipfile.ZipFile(tmp_path, 'r') as zipf:
            all_files = [name for name in zipf.namelist() if not name.endswith('/')]
            mag = models.Mag(
                file_name=file.filename,
                file_size=tmp_path.stat().st_size,
                total_files=len(all_files)
            )
            db.add(mag)
            db.commit()
            db.refresh(mag)

            audio_records = []
            markdown_records = []

            # Primeiro extrair tudo que é necessário
            for name in all_files:
                data = zipf.read(name)
                if is_audio(name):
                    # Persistir arquivo de áudio no storage/audio
                    safe_name = f"{mag.id}_{Path(name).name}".replace(' ', '_')
                    out_path = audio_dir / safe_name
                    with open(out_path, 'wb') as af:
                        af.write(data)
                    rel_path = out_path.relative_to(storage_dir)
                    audio = models.AudioFile(
                        mag_id=mag.id,
                        file_name=Path(name).name,
                        size=len(data),
                        mime_type='audio/mpeg',
                        storage_path=str(rel_path),
                        file_url=f"/storage/{rel_path.as_posix()}",
                    )
                    db.add(audio)
                    db.commit()
                    db.refresh(audio)
                    audio_records.append(audio)
                elif is_markdown(name):
                    text = data.decode('utf-8', errors='replace')
                    title = extract_markdown_title(text) or Path(name).stem
                    md = models.MarkdownFile(
                        mag_id=mag.id,
                        file_name=Path(name).name,
                        title=title,
                        content=text,
                    )
                    db.add(md)
                    db.commit()
                    db.refresh(md)
                    markdown_records.append(md)
            # Relacionamentos
            for md in markdown_records:
                refs = detect_references(md.content, [a.file_name for a in audio_records] + [m.file_name for m in markdown_records])
                for ref in refs:
                    tgt_audio = next((a for a in audio_records if a.file_name == ref), None)
                    if tgt_audio:
                        rel = models.Relationship(source_id=md.id, source_type='markdown', target_id=tgt_audio.id, target_type='audio')
                        db.add(rel)
                    else:
                        tgt_md = next((m for m in markdown_records if m.file_name == ref and m.id != md.id), None)
                        if tgt_md:
                            rel = models.Relationship(source_id=md.id, source_type='markdown', target_id=tgt_md.id, target_type='markdown')
                            db.add(rel)
                db.commit()

    finally:
        if tmp_path.exists():
            tmp_path.unlink()

    # Ajustar formato esperado pelo front: audioFiles com blobUrl apontando para file_url
    audios_out = []
    for a in db.query(models.AudioFile).filter(models.AudioFile.mag_id == mag.id).all():
        audios_out.append({
            'id': a.id,
            'mag_id': a.mag_id,
            'file_name': a.file_name,
            'size': a.size,
            'mime_type': a.mime_type,
            'file_url': a.file_url,
            'date_added': a.date_added,
        })
    mds_out = db.query(models.MarkdownFile).filter(models.MarkdownFile.mag_id == mag.id).all()
    return {
        'mag': mag,
        'audioFiles': audios_out,
        'markdownFiles': mds_out,
    }

# Listagens
@app.get('/files/audio', response_model=list[schemas.AudioFileOut])
def list_audio(db: Session = Depends(get_db), current=Depends(auth.get_current_user)):
    return db.query(models.AudioFile).order_by(models.AudioFile.date_added.desc()).all()

@app.get('/files/markdown', response_model=list[schemas.MarkdownFileOut])
def list_markdown(db: Session = Depends(get_db), current=Depends(auth.get_current_user)):
    return db.query(models.MarkdownFile).order_by(models.MarkdownFile.date_added.desc()).all()

@app.get('/files/audio/{file_id}', response_model=schemas.AudioFileOut)
def get_audio(file_id: int, db: Session = Depends(get_db), current=Depends(auth.get_current_user)):
    audio = db.query(models.AudioFile).filter(models.AudioFile.id == file_id).first()
    if not audio:
        raise HTTPException(status_code=404, detail='Áudio não encontrado')
    return audio

@app.get('/files/markdown/{file_id}', response_model=schemas.MarkdownFileOut)
def get_markdown(file_id: int, db: Session = Depends(get_db), current=Depends(auth.get_current_user)):
    md = db.query(models.MarkdownFile).filter(models.MarkdownFile.id == file_id).first()
    if not md:
        raise HTTPException(status_code=404, detail='Markdown não encontrado')
    return md

@app.delete('/files/audio/{file_id}')
def delete_audio(file_id: int, db: Session = Depends(get_db), current=Depends(auth.get_current_user)):
    audio = db.query(models.AudioFile).filter(models.AudioFile.id == file_id).first()
    if not audio:
        raise HTTPException(status_code=404, detail='Áudio não encontrado')
    # Remover arquivo físico
    physical = storage_dir / audio.storage_path
    if physical.exists():
        physical.unlink()
    db.delete(audio)
    db.commit()
    return {"status": "ok"}

@app.delete('/files/markdown/{file_id}')
def delete_markdown(file_id: int, db: Session = Depends(get_db), current=Depends(auth.get_current_user)):
    md = db.query(models.MarkdownFile).filter(models.MarkdownFile.id == file_id).first()
    if not md:
        raise HTTPException(status_code=404, detail='Markdown não encontrado')
    db.delete(md)
    db.commit()
    return {"status": "ok"}

@app.get('/files/search', response_model=schemas.SearchResult)
def search_files(term: str = Query(""), db: Session = Depends(get_db), current=Depends(auth.get_current_user)):
    if not term.strip():
        audios = db.query(models.AudioFile).all()
        markdowns = db.query(models.MarkdownFile).all()
    else:
        like = f"%{term}%"
        audios = db.query(models.AudioFile).filter(models.AudioFile.file_name.ilike(like)).all()
        markdowns = db.query(models.MarkdownFile).filter(
            (models.MarkdownFile.file_name.ilike(like)) |
            (models.MarkdownFile.title.ilike(like)) |
            (models.MarkdownFile.content.ilike(like))
        ).all()
    return schemas.SearchResult(audios=audios, markdowns=markdowns)

@app.get('/relationships/{source_id}', response_model=list[schemas.RelationshipOut])
def get_relationships(source_id: int, db: Session = Depends(get_db), current=Depends(auth.get_current_user)):
    rels = db.query(models.Relationship).filter(models.Relationship.source_id == source_id).all()
    return rels

@app.get('/mags', response_model=list[schemas.MagOut])
def list_mags(db: Session = Depends(get_db), current=Depends(auth.get_current_user)):
    return db.query(models.Mag).order_by(models.Mag.date_processed.desc()).all()

# Servir arquivos de áudio estáticos
from fastapi.staticfiles import StaticFiles
app.mount('/storage', StaticFiles(directory=storage_dir), name='storage')

@app.get('/')
def root():
    return {"status": "ok", "name": settings.app_name}
