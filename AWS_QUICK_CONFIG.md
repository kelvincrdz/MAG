# ⚡ Configuração Rápida AWS App Runner

## 📋 Cole no Console AWS

### Comando de Compilação (Build Command):

```
pip install -r requirements.txt
```

### Comando Start (Start Command):

```
python manage.py migrate --noinput && python manage.py collectstatic --noinput --clear && gunicorn --bind :8000 --workers 2 --threads 4 --timeout 60 --access-logfile - --error-logfile - mag_player.wsgi:application
```

### Porta (Port):

```
8000
```

---

## 🔐 Variáveis de Ambiente (Environment Variables)

Configure estas no console do App Runner:

```
SECRET_KEY = (gere uma nova - veja comando abaixo)
DEBUG = False
ALLOWED_HOSTS = sua-url.awsapprunner.com
DJANGO_SETTINGS_MODULE = mag_player.settings
PYTHONUNBUFFERED = 1
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
```

### 🔑 Gerar SECRET_KEY:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## ✅ Alternativa: Usar apprunner.yaml

Se preferir usar o arquivo de configuração:

1. Selecione "Usar um arquivo de configuração" no console
2. O arquivo `apprunner.yaml` já está pronto na raiz do projeto
3. Configure apenas as variáveis de ambiente acima

---

## 📝 Após o Deploy

1. Copie a URL gerada pelo App Runner
2. Atualize a variável `ALLOWED_HOSTS` com essa URL
3. Adicione a URL em `CSRF_TRUSTED_ORIGINS` se necessário:
   ```
   CSRF_TRUSTED_ORIGINS = https://sua-url.awsapprunner.com
   ```
