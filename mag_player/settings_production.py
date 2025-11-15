"""
Configurações de produção para PythonAnywhere
Importe este arquivo no settings.py ou use como settings alternativo
"""

from .settings import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# ALLOWED_HOSTS para PythonAnywhere
ALLOWED_HOSTS = ['nivelkdev.pythonanywhere.com']

# Static files para produção
STATIC_ROOT = BASE_DIR / 'staticfiles'

# SECURITY WARNING: gere uma nova SECRET_KEY para produção!
# Use: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
# Substitua a linha abaixo com sua nova chave:
# SECRET_KEY = 'sua-nova-secret-key-aqui'

# Configurações de segurança adicionais para produção
SECURE_SSL_REDIRECT = False  # PythonAnywhere já lida com SSL
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Logging para produção
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django_errors.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'ERROR',
            'propagate': True,
        },
    },
}
