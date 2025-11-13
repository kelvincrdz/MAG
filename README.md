# MAG Player (Vite + React)

Aplicação 100% frontend (sem backend Python) para processar e tocar arquivos .mag diretamente no navegador.

## Como rodar

```pwsh
# instalar dependências
npm install

# rodar em desenvolvimento
npm run dev

# abrir: http://localhost:5173

# build de produção (gera pasta dist/)
npm run build

# pré-visualizar o build
npm run preview
```

## O que mudou nesta migração

- Removido Next.js e o backend FastAPI (Python) do fluxo de execução.
- Criado projeto Vite + React (SPA) com rotas: `/` (Login), `/player` (Player), `/files` (Arquivos).
- Processamento de `.mag` é feito no cliente via `utils/magProcessor.js` (JSZip), sem upload.
- Dados de lista/relacionamentos são lidos do armazenamento local (`localStorage`) via `utils/database.js`.
- Autenticação local por código (utils/users.js) com sessão em `localStorage` (mag-next/utils/auth.js).
- PWA básico mantido (manifest e sw.js) via public/ e registro simples no `src/main.jsx`.

## Estrutura principal

- `src/` código da SPA (React + Vite)
  - `src/pages/Login.jsx`
  - `src/pages/Player.jsx`
  - `src/pages/Files.jsx`
  - `src/App.jsx` (rotas)
  - `src/main.jsx` (bootstrap)
- `components/MarkdownViewer.jsx` (visualização de markdown)
- `utils/` (processamento .mag, auth e dados locais)
- `styles/globals.css` (estilos)

## Testes

O teste existente de processamento local foi mantido:

```pwsh
npm run test:mag
```

## Observações

- Pastas e arquivos do backend Python e do Next.js foram preservados apenas como histórico; não são usados pelo build Vite.
- Se desejar, você pode removê-los no futuro para enxugar o repositório.
