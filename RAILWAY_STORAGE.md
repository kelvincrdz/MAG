# ⚠️ Importante: Storage Efêmero no Railway

## O Problema

O Railway usa **containers efêmeros**, o que significa:

- ✅ Arquivos enviados funcionam **temporariamente**
- ❌ Arquivos são **perdidos** quando o container reinicia
- ❌ Arquivos não são **compartilhados** entre múltiplas instâncias

## Situação Atual

**Upload de arquivos funciona MAS:**

- Os arquivos `.mag` serão salvos em `/app/media/packages/`
- Funcionará até o próximo deploy ou restart
- Depois disso, os arquivos desaparecem

## Soluções

### Opção 1: Cloudinary (Recomendado - Gratuito)

Configure as variáveis no Railway (veja `CLOUDINARY_SETUP.md`):

```
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=seu-api-secret
```

**Vantagens:**

- ✅ Gratuito até 25 GB
- ✅ Arquivos persistem para sempre
- ✅ Configuração simples
- ✅ Já está implementado no código

### Opção 2: Railway Volumes (Pago)

Railway oferece volumes persistentes, mas é pago:

- Custo: ~$0.25/GB por mês
- Requer configuração no dashboard

### Opção 3: Aceitar Storage Temporário

Se você está apenas testando ou os arquivos podem ser reenviados:

- ✅ Funciona sem configuração adicional
- ❌ Perde arquivos a cada deploy/restart
- ❌ Não recomendado para produção

## Como Testar Agora

Mesmo sem Cloudinary, você pode:

1. **Fazer upload de um arquivo `.mag`**
   - Funcionará normalmente
2. **Usar o player**

   - Os áudios e arquivos funcionarão

3. **Até o próximo deploy**
   - Quando fizer novo deploy, os arquivos serão perdidos

## Recomendação

Configure o Cloudinary seguindo `CLOUDINARY_SETUP.md` - leva apenas 2 minutos e garante que seus arquivos nunca sejam perdidos! 🚀
