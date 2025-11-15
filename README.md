# MAG Player Django

## Descrição

Site Django com player de áudio estilo cassette vintage com animação das fitas.

## Instalação

1. Crie um ambiente virtual:

```bash
python -m venv venv
```

2. Ative o ambiente virtual:

```bash
# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Windows CMD
venv\Scripts\activate.bat
```

3. Instale as dependências:

```bash
pip install -r requirements.txt
```

4. Execute as migrações:

```bash
python manage.py migrate
```

5. Inicie o servidor:

```bash
python manage.py runserver
```

6. Acesse no navegador:

```
http://localhost:8000
```

## Código de Acesso Padrão

**Código:** ORC/DDAE-11.25

## Recursos

- Player de áudio com animação de cassette vintage
- Suporte a arquivos .mag
- Animação sincronizada das fitas com o progresso do áudio
- Interface moderna com estilo retro
- Sistema de login com código de acesso
- Controles de reprodução (play/pause, avançar, retroceder)

## Estrutura do Projeto

```
MAG_django/
├── mag_player/          # Configurações do projeto Django
├── player/              # App principal
├── static/              # Arquivos estáticos (CSS, JS)
├── templates/           # Templates HTML
├── media/               # Arquivos de mídia (uploads)
└── manage.py           # Script de gerenciamento Django
```
