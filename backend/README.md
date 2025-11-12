# Backend MAG (FastAPI)

Backend em Python (FastAPI) para autenticação por código, processamento de arquivos .mag (ZIP), gestão de usuários e arquivos (áudio/markdown) com persistência em SQLite.

## Como rodar (Windows PowerShell)

1. Criar e ativar um ambiente virtual (opcional, recomendado):

```powershell
python -m venv .venv ; .\.venv\Scripts\Activate.ps1
```

2. Instalar dependências:

```powershell
pip install -r backend/requirements.txt
```

3. Rodar o servidor em desenvolvimento (porta 8000):

```powershell
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

4. No front, crie/ajuste o arquivo `.env.local` na raiz do projeto:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

5. Endpoints (documentação automática):
- Swagger: http://localhost:8000/docs
- Redoc: http://localhost:8000/redoc

## Principais rotas
- POST `/auth/login` — login com `codigo` (retorna `access_token` + dados do usuário)
- POST `/mags/process` — upload de arquivo `.mag` para processamento no servidor
- GET `/files/audio` — listar áudios
- GET `/files/markdown` — listar markdowns
- GET `/files/audio/{id}` — obter áudio por id (metadados)
- GET `/files/markdown/{id}` — obter markdown por id
- DELETE `/files/audio/{id}` — deletar áudio
- DELETE `/files/markdown/{id}` — deletar markdown
- GET `/files/search?term=...` — buscar por termo
- GET `/relationships/{source_id}` — relacionamentos de um arquivo markdown

Arquivos de áudio são servidos estáticamente de `/storage/audio/{nome_gerado}`.

## Notas
- Banco: `backend/data/app.db` (SQLite)
- Usuários iniciais são carregados a partir dos códigos existentes no front (`utils/users.js`).
- Autenticação via JWT (header `Authorization: Bearer <token>`).
