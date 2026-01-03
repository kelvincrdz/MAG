# Sistema de RPG Web

Sistema completo de gerenciamento de RPG com React, Tailwind CSS e Supabase.

## Funcionalidades

- ✅ Autenticação simples (jogadores sem senha, mestre com senha)
- ✅ Atributos personalizáveis com cores customizadas
- ✅ Barras de recursos dinâmicas
- ✅ Notas do mestre com autosave
- ✅ Carrossel de iniciativa com sincronização realtime
- ✅ Biblioteca de investigação hierárquica (casos > pastas > arquivos)
- ✅ Viewers completos (Markdown, Áudio, Vídeo, Imagem, PDF)
- ✅ Sistema de dados virtuais
- ✅ Dashboards para mestre e jogadores
- ✅ Modo combate com timer e condições

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure o Supabase:

   - Crie um projeto em https://supabase.com
   - Execute o SQL em `supabase-schema.sql`
   - Crie os buckets: `avatars` e `investigation-files`
   - Configure as políticas RLS conforme o schema

4. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais do Supabase.

5. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Estrutura do Projeto

```
src/
├── components/       # Componentes React
├── hooks/           # Custom hooks
├── lib/             # Utilitários e configurações
├── pages/           # Páginas principais
└── utils/           # Funções auxiliares
```

## Tecnologias

- React 18
- Tailwind CSS
- Supabase (PostgreSQL + Storage + Realtime)
- Vite
- React Markdown
- React PDF
- DnD Kit (Drag & Drop)
- Lucide React (Ícones)

## Paleta de Cores

- **Vermelho Principal**: #d8263e
- **Azul Escuro**: #03182b
- **Fundo**: #0a0e17
- **Superfície**: #1a1f2e
- **Texto**: #f8f9fa
