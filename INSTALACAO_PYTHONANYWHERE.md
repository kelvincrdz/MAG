# Guia de Instalação - MAG Player no PythonAnywhere

## 📋 Pré-requisitos

- Repositório clonado em `/home/nivelKdev/Mag` ✅
- Python 3.13 configurado ✅

## 🔧 Passos de Instalação

### 1. Criar e Ativar o Ambiente Virtual

No console do PythonAnywhere (Bash), execute:

```bash
cd /home/nivelKdev
mkvirtualenv mag_env --python=python3.13
```

Se o comando `mkvirtualenv` não funcionar, use:

```bash
python3.13 -m venv /home/nivelKdev/.virtualenvs/mag_env
source /home/nivelKdev/.virtualenvs/mag_env/bin/activate
```

### 2. Instalar Dependências

Com o ambiente virtual ativo:

```bash
cd /home/nivelKdev/Mag
pip install -r requirements.txt
```

### 3. Configurar ALLOWED_HOSTS

Edite o arquivo `/home/nivelKdev/Mag/mag_player/settings.py` e atualize:

```python
ALLOWED_HOSTS = ['nivelkdev.pythonanywhere.com']
```

### 4. Configurar Arquivos Estáticos

No settings.py, adicione (se não existir):

```python
STATIC_ROOT = '/home/nivelKdev/Mag/staticfiles'
```

Execute o collectstatic:

```bash
cd /home/nivelKdev/Mag
python manage.py collectstatic --noinput
```

### 5. Configurar o Banco de Dados

Execute as migrações:

```bash
cd /home/nivelKdev/Mag
python manage.py migrate
```

Crie um superusuário:

```bash
python manage.py createsuperuser
```

### 6. Configurar o WSGI

No painel do PythonAnywhere, vá para **Web** → **WSGI configuration file** e substitua o conteúdo por:

```python
import os
import sys

# Adiciona o diretório do projeto ao sys.path
path = '/home/nivelKdev/Mag'
if path not in sys.path:
    sys.path.insert(0, path)

# Configura a variável de ambiente para o settings do Django
os.environ['DJANGO_SETTINGS_MODULE'] = 'mag_player.settings'

# Ativa o ambiente virtual
virtualenv_path = '/home/nivelKdev/.virtualenvs/mag_env/lib/python3.13/site-packages'
if virtualenv_path not in sys.path:
    sys.path.insert(0, virtualenv_path)

# Importa o Django WSGI handler
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

### 7. Configurar Virtualenv na Interface Web

No painel **Web**:

1. Procure a seção **Virtualenv**
2. Adicione o caminho: `/home/nivelKdev/.virtualenvs/mag_env`

### 8. Configurar Diretórios Estáticos e Media

Na seção **Static files** do painel Web, adicione:

| URL      | Directory                       |
| -------- | ------------------------------- |
| /static/ | /home/nivelKdev/Mag/staticfiles |
| /media/  | /home/nivelKdev/Mag/media       |

### 9. Recarregar a Aplicação

Clique no botão verde **Reload** no topo da página Web.

## 🔒 Configurações de Segurança (IMPORTANTE!)

### Alterar SECRET_KEY

1. Gere uma nova SECRET_KEY:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

2. Edite `/home/nivelKdev/Mag/mag_player/settings.py`:

```python
SECRET_KEY = 'sua-nova-secret-key-aqui'
DEBUG = False
```

## 📁 Estrutura de Diretórios Esperada

```
/home/nivelKdev/
├── Mag/                          # Código do projeto
│   ├── manage.py
│   ├── mag_player/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── player/
│   ├── templates/
│   ├── static/
│   ├── media/
│   ├── staticfiles/              # Será criado pelo collectstatic
│   └── db.sqlite3
└── .virtualenvs/
    └── mag_env/                  # Ambiente virtual
```

## 🐛 Troubleshooting

### Erro de Import

Se encontrar erros de import, verifique:

```bash
# No console Bash
workon mag_env
cd /home/nivelKdev/Mag
python manage.py check
```

### Arquivos Estáticos Não Carregam

1. Verifique se executou `collectstatic`
2. Confirme os caminhos na seção Static files
3. Verifique permissões: `chmod -R 755 /home/nivelKdev/Mag/staticfiles`

### Erro 500

1. Ative temporariamente `DEBUG = True` no settings.py
2. Verifique os logs de erro no painel Web
3. Verifique o log em `/var/log/`

### Banco de Dados Locked

```bash
# Pare todos os processos que possam estar usando o banco
pkill -u nivelKdev python
# Recarregue a aplicação no painel Web
```

## ✅ Checklist Final

- [ ] Ambiente virtual criado e ativado
- [ ] Dependências instaladas
- [ ] ALLOWED_HOSTS configurado
- [ ] collectstatic executado
- [ ] Migrações aplicadas
- [ ] Superusuário criado
- [ ] WSGI configurado corretamente
- [ ] Virtualenv configurado na interface Web
- [ ] Diretórios static e media configurados
- [ ] SECRET_KEY alterada
- [ ] DEBUG = False em produção
- [ ] Aplicação recarregada

## 🌐 Acessar o Site

Após completar todos os passos, acesse:

- Site: https://nivelkdev.pythonanywhere.com
- Admin: https://nivelkdev.pythonanywhere.com/admin

## 📝 Notas Importantes

1. **Backup Regular**: Faça backup do `db.sqlite3` e da pasta `media/` regularmente
2. **Limites do PythonAnywhere**: Conta gratuita tem limites de CPU e armazenamento
3. **Atualizações**: Para atualizar o código:
   ```bash
   cd /home/nivelKdev/Mag
   git pull
   python manage.py migrate
   python manage.py collectstatic --noinput
   # Recarregue no painel Web
   ```

## 🆘 Links Úteis

- [Documentação PythonAnywhere Django](https://help.pythonanywhere.com/pages/DeployExistingDjangoProject/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)
