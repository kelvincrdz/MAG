# Exemplo de Documentação

Este é um exemplo de arquivo Markdown que demonstra todas as funcionalidades de renderização implementadas no MAG Player.

## Formatação Básica

Este parágrafo contém **texto em negrito**, _texto em itálico_, e **_texto em negrito e itálico_**.

Você também pode usar `código inline` para destacar comandos ou variáveis.

## Listas

### Lista não ordenada:

- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2
- Item 3

### Lista ordenada:

1. Primeiro passo
2. Segundo passo
3. Terceiro passo

## Blocos de Código

### Python

```python
def reproduzir_audio(arquivo):
    """Reproduz um arquivo de áudio"""
    player = AudioPlayer()
    player.load(arquivo)
    player.play()
    return True
```

### JavaScript

```javascript
const playAudio = (file) => {
  const audio = new Audio(file);
  audio.play();
};
```

## Citações

> "A música é a linguagem universal da humanidade."
> — Henry Wadsworth Longfellow

## Tabelas

| Formato | Extensão | Suportado |
| ------- | -------- | --------- |
| MP3     | .mp3     | ✅        |
| WAV     | .wav     | ✅        |
| OGG     | .ogg     | ✅        |
| FLAC    | .flac    | ✅        |

## Links

Visite o [site oficial do Django](https://www.djangoproject.com/) para mais informações.

## Separador Horizontal

---

## Notas Finais

Este documento demonstra a capacidade de renderização completa de Markdown, incluindo:

- Headers de diferentes níveis
- Formatação de texto
- Listas aninhadas
- Blocos de código com syntax highlighting
- Citações estilizadas
- Tabelas formatadas
- Links funcionais

_Última atualização: 15 de novembro de 2025_
