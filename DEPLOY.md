# Guia de Deploy - MAG Player

## Configurações de Produção

### Render.com

O projeto está configurado para deploy automático no Render usando o arquivo `render.yaml`.

#### Variáveis de Ambiente Necessárias

As seguintes variáveis já estão configuradas no `render.yaml`:

- `DEBUG=False` - Desativa modo debug em produção
- `SECRET_KEY` - Gerada automaticamente pelo Render
- `ALLOWED_HOSTS=mag-ps6z.onrender.com,.onrender.com` - **IMPORTANTE:** Inclui seu domínio específico
- `CSRF_TRUSTED_ORIGINS=https://mag-ps6z.onrender.com,https://*.onrender.com` - Configuração de segurança CSRF
- `CSRF_COOKIE_SECURE=True` - Cookies seguros em HTTPS
- `SESSION_COOKIE_SECURE=True` - Sessão segura em HTTPS
- `DATABASE_URL` - Configurada automaticamente pelo banco PostgreSQL

**⚠️ IMPORTANTE:** Ao fazer deploy no Render, substitua `mag-ps6z.onrender.com` pelo seu domínio real.

#### Build e Deploy

O Render executará automaticamente:

1. **Build:**

   ```bash
   pip install -r requirements.txt
   python manage.py collectstatic --noinput  # Coleta arquivos estáticos
   python manage.py migrate                   # Aplica migrações
   ```

2. **Start:**
   ```bash
   gunicorn mag_player.wsgi:application
   ```

### Arquivos Estáticos em Produção

O projeto usa **WhiteNoise** para servir arquivos estáticos quando `DEBUG=False`.

Configurações no `settings.py`:

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Deve estar logo após SecurityMiddleware
    ...
]

# Usa CompressedStaticFilesStorage (sem manifest) para evitar erros de cache
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'
```

**Nota:** Usamos `CompressedStaticFilesStorage` em vez de `CompressedManifestStaticFilesStorage` para evitar erros de "Missing staticfiles manifest entry" que podem ocorrer com cache.

### Verificação Pós-Deploy

Após o deploy, verifique:

1. ✅ CSS carrega corretamente (verifique o console do navegador)
2. ✅ JavaScript funciona (player de áudio)
3. ✅ Upload de arquivos .mag funciona
4. ✅ Visualização de markdowns funciona
5. ✅ Login com código de acesso funciona

### Solução de Problemas

#### Erro 500 Internal Server Error

**Sintoma:** Servidor retorna erro 500 ao acessar qualquer página

**Causas comuns:**

1. `ALLOWED_HOSTS` não inclui o domínio do servidor
2. `SECRET_KEY` não está configurada
3. Banco de dados não está acessível
4. Arquivos estáticos não foram coletados

**Solução:**

1. Verifique os logs do Render no dashboard (aba "Logs")
2. Confirme que `ALLOWED_HOSTS` no `render.yaml` inclui seu domínio exato
3. Verifique se o banco de dados está online
4. Force um redeploy completo

**Como verificar os logs no Render:**

- Acesse o dashboard do seu serviço
- Clique na aba "Logs"
- Procure por linhas com "ERROR" ou "Exception"
- Os logs mostrarão o erro específico

#### Erro 404 nos arquivos estáticos

**Sintoma:** `Failed to load resource: the server responded with a status of 404`

**Solução:**

1. Verifique se o `collectstatic` foi executado no build
2. Confirme que o WhiteNoise está instalado: `pip show whitenoise`
3. Verifique a ordem do middleware no `settings.py`
4. Force um novo deploy no Render

#### Erro de MIME type

**Sintoma:** `Refused to apply style because its MIME type ('text/html') is not a supported stylesheet MIME type`

**Causa:** Arquivos estáticos não foram coletados corretamente.

**Solução:**

1. Execute manualmente no servidor: `python manage.py collectstatic --noinput`
2. Verifique se `STATICFILES_STORAGE` está configurado corretamente

#### Missing staticfiles manifest entry

**Sintoma:** `ValueError: Missing staticfiles manifest entry for 'css/style.css'`

**Causa:** O `CompressedManifestStaticFilesStorage` exige um manifest que pode não ser gerado corretamente.

**Solução:**

1. No `settings.py`, use `CompressedStaticFilesStorage` em vez de `CompressedManifestStaticFilesStorage`:
   ```python
   STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'
   ```
2. Faça commit e push para forçar novo deploy
3. Limpe o cache de build no Render se necessário

#### Erro CSRF

**Sintoma:** CSRF verification failed

**Solução:**

1. Confirme que `CSRF_TRUSTED_ORIGINS` inclui seu domínio
2. Verifique se `CSRF_COOKIE_SECURE=True` está definido
3. Certifique-se de que está usando HTTPS

### Deploy Local para Testes

Para testar em modo produção localmente:

```bash
# Criar arquivo .env
DEBUG=False
SECRET_KEY=sua-chave-secreta-aqui
ALLOWED_HOSTS=localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=http://localhost:8000

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Rodar com Gunicorn
gunicorn mag_player.wsgi:application
```

### Estrutura de Arquivos Estáticos

```
MAG/
├── static/              # Arquivos fonte
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── player.js
├── staticfiles/         # Gerado pelo collectstatic (não versionar)
└── media/              # Uploads de usuários (.mag)
    └── packages/
```

**Importante:** Adicione `staticfiles/` ao `.gitignore` para não versionar arquivos gerados.
