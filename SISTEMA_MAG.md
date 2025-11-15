# Sistema de Arquivos .mag - Documentação

## Estrutura recomendada do .mag (obrigatória para o player principal)

Para melhor experiência e associação automática entre áudios e markdowns, utilize a seguinte estrutura dentro do ZIP:

```
Depoimento/Depoimento.mp3        <- Áudio principal reproduzido no player
Arquivos/Arquivos.md             <- Documento associado (renderizado e com anexos)
Arquivos/Arquivos.mp3            <- (Opcional) Áudio(s) adicional(is) anexado(s) ao markdown
Arquivos/qualquer-*.mp3          <- (Opcional) Todo áudio dentro de Arquivos/ será anexado
```

Regras aplicadas pelo sistema:

- O arquivo `Depoimento/Depoimento.mp3` é marcado como `role = primary` e será o primeiro a tocar no player.
- O arquivo `Arquivos/Arquivos.md` recebe tag `association_tag = arquivos` e terá vínculos para todos os áudios presentes dentro da pasta `Arquivos/`.
- Cada item retornado (áudio e markdown) possui metadados opcionais: `internal_path`, `role` (para áudios) e `association_tag`.

Observação: Se o seu `.mag` não seguir exatamente essa estrutura, o sistema ainda tentará processar o conteúdo de forma genérica; porém, o comportamento de priorização do áudio principal e a associação automática podem não ocorrer.

## 📦 O que é um arquivo .mag?

Um arquivo `.mag` é um arquivo ZIP que pode conter múltiplos tipos de conteúdo:

- **Arquivos de áudio** (mp3, wav, ogg, m4a, aac, flac, webm)
- **Arquivos Markdown** (.md) com documentação, letras, notas, etc.

## 🚀 Como usar

### 1. Criando um arquivo .mag

Para criar um arquivo .mag:

1. Coloque seus arquivos de áudio e/ou markdown em uma pasta
2. Compacte a pasta em um arquivo ZIP
3. Renomeie a extensão de `.zip` para `.mag`

**Exemplo de estrutura:**

```
meu-album.mag (ZIP contendo:)
├── faixa01.mp3
├── faixa02.mp3
├── faixa03.mp3
├── README.md
└── letra-faixa01.md
```

### 2. Carregando no Player

1. Faça login no sistema com seu código de acesso
2. Na página do **Player**, clique no botão "Abrir arquivo" (📁)
3. Selecione seu arquivo `.mag`
4. O sistema irá:
   - Extrair todo o conteúdo do arquivo
   - Salvar áudios e markdowns no banco de dados local
   - Começar a reproduzir o primeiro áudio automaticamente
   - Criar vínculos entre arquivos relacionados

### 3. Navegando entre faixas

Se o arquivo `.mag` contém múltiplos áudios:

- Use os botões **⏮️ Anterior** e **⏭️ Próxima** para navegar
- O contador mostra: "Faixa X de Y"
- Os controles de faixa aparecem automaticamente quando há múltiplos áudios

### 4. Visualizando arquivos salvos

1. No player, clique no botão **📁 Ver Arquivos**
2. Na página de **Arquivos**, você pode:
   - Ver todos os `.mag` processados
   - Listar todos os áudios salvos
   - Visualizar todos os markdowns
   - Buscar por nome ou conteúdo
   - Filtrar por tipo (Áudios ou Markdowns)

### 5. Visualizador de Markdown

Para ver um arquivo markdown:

1. Na página de **Arquivos**, encontre o markdown desejado
2. Clique no botão **👁️ Visualizar**
3. O visualizador mostra:
   - Conteúdo formatado do markdown
   - Data de adição
   - **Arquivos relacionados** (se houver vínculos)

### 6. Sistema de Vínculos

O sistema detecta automaticamente relacionamentos entre arquivos:

**Como funciona:**

- Se um markdown menciona o nome de um arquivo de áudio, um vínculo é criado
- Se um markdown referencia outro markdown, também há vínculo
- Os vínculos aparecem na seção "Arquivos Relacionados" do visualizador

**Exemplo:**

```markdown
# Faixa 01 - Minha Música

Esta é a letra da música presente no arquivo `faixa01.mp3`.

Veja também: `notas-producao.md` para detalhes técnicos.
```

Neste caso, o sistema criará vínculos entre:

- `letra.md` ↔ `faixa01.mp3`
- `letra.md` ↔ `notas-producao.md`

## 🗄️ Armazenamento

Todos os arquivos são salvos localmente no navegador usando **IndexedDB**:

- ✅ Não precisa de servidor
- ✅ Funciona offline
- ✅ Dados persistem entre sessões
- ✅ Privacidade total (dados ficam no seu computador)

### Gerenciando o armazenamento

- **Excluir arquivo:** Use o botão 🗑️ ao lado de cada arquivo
- **Buscar:** Digite na caixa de busca para filtrar por nome ou conteúdo
- **Limpar tudo:** Use as ferramentas de desenvolvedor do navegador (F12)

## 🎵 Funcionalidades do Player

### Controles disponíveis:

- **📁 Abrir:** Carregar arquivo .mag
- **⏮️ Anterior:** Faixa anterior (quando há múltiplos áudios)
- **⏪ -10s:** Retroceder 10 segundos
- **▶️/⏸️ Play/Pause:** Reproduzir ou pausar
- **⏩ +10s:** Avançar 10 segundos
- **⏭️ Próxima:** Próxima faixa (quando há múltiplos áudios)
- **👤 Usuário:** Ver informações do usuário
- **📁 Arquivos:** Ir para página de arquivos
- **🚪 Sair:** Fazer logout

### Atalhos de teclado:

- **Espaço:** Play/Pause
- **Seta Esquerda:** Retroceder 10s
- **Seta Direita:** Avançar 10s
- **O:** Abrir arquivo

## 📊 Estatísticas

A página de Arquivos mostra:

- Total de arquivos `.mag` processados
- Quantidade de áudios salvos
- Quantidade de markdowns salvos

## 🔍 Busca

A busca procura em:

- Nomes de arquivos
- Títulos de markdowns
- Conteúdo completo dos markdowns

## 💡 Dicas

1. **Organize seus .mag por tema:** Crie um .mag para cada álbum, aula, podcast, etc.
2. **Use markdowns para documentação:** Adicione letras, notas de produção, créditos
3. **Nomeie arquivos de forma clara:** Facilita a busca e organização
4. **Referencie arquivos nos markdowns:** Crie vínculos automáticos mencionando nomes de arquivo

## 🛠️ Tecnologias

- **Next.js**: Framework React
- **IndexedDB**: Banco de dados local
- **JSZip**: Extração de arquivos ZIP
- **React Markdown**: Renderização de markdown
- **Web Audio API**: Reprodução de áudio

## 📝 Formato Markdown Suportado

O visualizador suporta:

- Títulos (# ## ###)
- Listas (ordenadas e não-ordenadas)
- Links
- Código inline e blocos
- Citações (blockquote)
- Negrito, itálico
- Parágrafos e quebras de linha

## ⚠️ Limites

- **Tamanho máximo:** Depende do espaço disponível no navegador (geralmente várias centenas de MB)
- **Formatos de áudio:** mp3, wav, ogg, m4a, aac, flac, webm
- **Formato de documento:** Apenas Markdown (.md)

## 🔒 Segurança

- Todos os dados ficam no seu navegador
- Nada é enviado para servidores externos
- Cada usuário tem acesso apenas aos seus próprios arquivos
- Sistema de autenticação por código institucional

## 🐛 Solução de Problemas

**Arquivo .mag não abre:**

- Verifique se é um ZIP válido
- Certifique-se que a extensão é exatamente `.mag`

**Áudio não reproduz:**

- Verifique o formato do arquivo
- Alguns formatos podem não ser suportados pelo navegador

**Markdowns não aparecem:**

- Certifique-se que os arquivos têm extensão `.md`
- Verifique se há conteúdo no arquivo

**Vínculos não funcionam:**

- Os nomes dos arquivos devem ser mencionados exatamente como estão
- A detecção é case-insensitive (não diferencia maiúsculas/minúsculas)
