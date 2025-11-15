# Configuração do Cloudinary para Upload de Arquivos

O projeto está configurado para usar **Cloudinary** para armazenamento de arquivos `.mag` em produção (Railway).

## Por que Cloudinary?

O Railway usa containers efêmeros - arquivos salvos na pasta `media/` são perdidos após restart ou deploy. O Cloudinary resolve isso armazenando os arquivos na nuvem de forma persistente.

## Passo a Passo

### 1. Criar Conta no Cloudinary (Gratuito)

1. Acesse: https://cloudinary.com/users/register_free
2. Crie uma conta gratuita (não precisa cartão de crédito)
3. Após login, você verá o **Dashboard**

### 2. Obter as Credenciais

No Dashboard do Cloudinary, você verá algo assim:

```
Cloud name: seu-cloud-name
API Key: 123456789012345
API Secret: AbCdEfGhIjKlMnOpQrStUvWxYz
```

### 3. Configurar no Railway

1. Acesse o **Dashboard do Railway**
2. Selecione seu projeto MAG
3. Vá em **Variables**
4. Adicione as seguintes variáveis de ambiente:

```
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz
```

**⚠️ IMPORTANTE:** Substitua pelos valores reais do seu Dashboard Cloudinary!

### 4. Deploy

Após configurar as variáveis:

1. Faça commit e push do código:

   ```bash
   git add .
   git commit -m "feat: Adicionar Cloudinary para storage de arquivos"
   git push
   ```

2. O Railway fará o deploy automaticamente

3. Teste fazendo upload de um arquivo `.mag`

## Como Funciona

- **Desenvolvimento local**: Arquivos salvos em `media/` (pasta local)
- **Produção (Railway)**: Arquivos salvos no Cloudinary (nuvem)

A detecção é automática baseada nas variáveis de ambiente.

## Plano Gratuito

O plano gratuito do Cloudinary oferece:

- ✅ 25 GB de armazenamento
- ✅ 25 GB de bandwidth/mês
- ✅ Suficiente para centenas de arquivos `.mag`

## Problemas Comuns

### Upload ainda dá erro?

- Verifique se as 3 variáveis estão configuradas no Railway
- Confirme que os valores estão corretos (sem espaços extras)
- Aguarde o deploy completar após adicionar as variáveis

### Arquivos antigos?

- Arquivos enviados antes da configuração do Cloudinary foram perdidos
- Apenas novos uploads serão persistidos

## Alternativas

Se preferir outro serviço:

- **AWS S3** (mais complexo, mas muito usado)
- **Google Cloud Storage**
- **DigitalOcean Spaces**

A configuração atual com Cloudinary é a mais simples e gratuita! 🚀
