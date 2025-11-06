# MAG Player 🎵

Um reprodutor de áudio web com visual de cassette vintage que lê arquivos MP3 com extensão .mag.

## ✨ Características

- **Sistema de Login**: Proteção por código de acesso
- **Visual Retrô**: Interface de cassette animado com estilo dos anos 80/90
- **Design Minimalista**: Botões circulares compactos apenas com ícones
- **Ícones Font Awesome**: Interface limpa e moderna
- **Controles Intuitivos**: 
  - 📁 Abrir arquivos .mag
  - ▶️ Play/Pause unificado
  - ⏪ Retroceder 10 segundos
  - ⏩ Avançar 10 segundos
- **Animação de Fitas**: As bobinas do cassette giram durante a reprodução
- **Progresso Sincronizado**: Tamanho das fitas reflete o progresso do áudio
- **Suporte a arquivos .mag**: Lê arquivos MP3 renomeados com extensão .mag
- **Interface Responsiva**: Funciona perfeitamente em desktop e mobile
- **Barra de Progresso Interativa**: Clique ou arraste para navegar no áudio

## 🎮 Como Usar

1. **Login**: Abra `index.html` e digite o código: **MAG2025**
2. **Carregar Música**: Clique no botão 📁 para selecionar um arquivo .mag
3. **Controles**:
   - **▶️/⏸️**: Reproduzir ou pausar a música
   - **⏪**: Retroceder 10 segundos
   - **⏩**: Avançar 10 segundos
   - **Barra de Progresso**: Clique para pular para qualquer posição
4. **Animação**: As fitas do cassette giram automaticamente durante a reprodução

## ⌨️ Atalhos do Teclado

- **Espaço**: Play/Pause
- **Seta Esquerda**: Retroceder 10s
- **Seta Direita**: Avançar 10s

## 📁 Estrutura dos Arquivos

```
MAG/
├── index.html          # Página de login
├── player.html         # Reprodutor com animação de cassette
├── styles.css          # Estilos retrô e animações CSS
├── script.js           # Lógica do sistema de login
├── player.js           # Controles do reprodutor e animações
└── README.md          # Este arquivo
```

## 🔧 Personalização

### Alterar Código de Acesso
Edite a variável no `script.js`:
```javascript
const CODIGO_CORRETO = "SEU_NOVO_CODIGO";
```

### Preparar Arquivos .mag
1. Pegue qualquer arquivo MP3
2. Renomeie a extensão: `musica.mp3` → `musica.mag`
3. Carregue no MAG Player!

## 🎨 Design Moderno e Elegante

- **Paleta de Cores**: Gradiente azul profundo (#001010) ao azul claro (#6ccff6)
- **Tipografia**: Helvetica para títulos, Merriweather (serifada) para textos
- **Efeitos**: Glass morphism com blur e transparências
- **Animações**: Transições suaves e efeitos de hover luminosos
- **Botões**: Design circular minimalista com efeitos de profundidade
- **Visual**: Interface futurista mantendo a nostalgia do cassette

## 🌐 Compatibilidade

Funciona em todos os navegadores modernos com suporte a:
- HTML5 Audio API
- CSS3 Animations  
- File API
- LocalStorage
- SVG Animations
- Font Awesome 6.4.0 (CDN)

## 📱 Responsividade

- **Desktop**: Interface completa com todos os controles
- **Tablet**: Layout adaptado mantendo funcionalidades
- **Mobile**: Controles otimizados para toque

---

**Divirta-se ouvindo suas músicas com estilo retrô! 📻✨**