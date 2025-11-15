# +++++++++++ DJANGO +++++++++++
# To use your own django app use code like this:
import os
import sys

# Adiciona o diretório do projeto ao sys.path
path = '/home/nivelKdev/Mag'
if path not in sys.path:
    sys.path.insert(0, path)

# Configura a variável de ambiente para o settings do Django
os.environ['DJANGO_SETTINGS_MODULE'] = 'mag_player.settings'

# Ativa o ambiente virtual (ajuste o caminho para seu virtualenv)
# Descomente e ajuste a linha abaixo se estiver usando um virtualenv
# virtualenv_path = '/home/nivelKdev/.virtualenvs/mag_env/lib/python3.13/site-packages'
# if virtualenv_path not in sys.path:
#     sys.path.insert(0, virtualenv_path)

# Importa o Django WSGI handler
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
