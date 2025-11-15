# MAG Player (Vite + React)

Aplicação 100% frontend para processar e tocar arquivos .mag diretamente no navegador (sem qualquer backend Python ou Next.js ativo).

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

## O que foi consolidado

- Removidos completamente: backend FastAPI (Python) e arquivos Next.js (pages/, next.config.js, mag-next/).
- SPA Vite + React com rotas: `/` (Login), `/player` (Player), `/files` (Arquivos).
- Processamento de `.mag` inteiramente no cliente via `utils/magProcessor.js` (JSZip) – sem upload para servidor.
- Persistência local (audios/markdowns/mags) em `localStorage` via `utils/database.js`.
- Autenticação local por código em `src/utils/auth.js` e `utils/users.js`.
- PWA básico (manifest + service worker) usando arquivos em `public/`.

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

## Deploy (Vercel)

`vercel.json` já configura:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Passos:

1. Conecte repositório no Vercel.
2. Build Command: `npm run build` | Output Directory: `dist` (detectado automaticamente).
3. Nenhuma variável de ambiente obrigatória (totalmente offline/local).
4. Após o deploy, qualquer rota SPA (`/player`, `/files`) reescreve para `index.html`.

## Segurança / Limitações

- Sem backend: exclusão real e multiusuário não existem; tudo é local ao navegador.
- Tokens ou JWT não são usados; autenticação é apenas uma verificação de código fixo.
- Para multiusuário real e persistência compartilhada você precisará reintroduzir um backend (Node/Express ou FastAPI).

## Próximos Passos Sugeridos

- Adicionar testes para componentes principais (Player, Files) usando Vitest/React Testing Library.
- Implementar opção de exportar histórico local (JSON) e importar em outro navegador.
- Otimizar bundle dividindo código do markdown viewer em chunk separado.

---

Todos os artefatos legados foram eliminados neste estágio – o repositório agora reflete apenas a aplicação Vite.
