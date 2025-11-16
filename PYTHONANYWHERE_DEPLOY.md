# Deploy no PythonAnywhere - MAG Player

Este guia explica como fazer o deploy da aplicação MAG Player no PythonAnywhere.

## Pré-requisitos

1. Conta no PythonAnywhere (gratuita ou paga)
2. Código do projeto no GitHub

## Passo a Passo

### 1. Criar Conta no PythonAnywhere

Acesse [https://www.pythonanywhere.com](https://www.pythonanywhere.com) e crie uma conta gratuita ou paga.

### 2. Abrir Console Bash

No dashboard do PythonAnywhere:

- Vá em "Consoles" → "Bash"
- Um novo console será aberto

### 3. Clonar o Repositório

```bash
git clone https://github.com/kelvincrdz/MAG.git
cd MAG
```

### 4. Criar Ambiente Virtual

```bash
mkvirtualenv --python=/usr/bin/python3.10 mag_player
```

### 5. Instalar Dependências

```bash
pip install -r requirements.txt
```

### 6. Configurar Banco de Dados

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

### 7. Configurar Web App

No dashboard do PythonAnywhere, vá em "Web" e:

1. Clique em "Add a new web app"
2. Escolha "Manual configuration"
3. Selecione Python 3.10
4. Clique em "Next"

### 8. Configurar WSGI

Na aba "Web":

1. Clique no link do arquivo WSGI (será algo como `/var/www/yourusername_pythonanywhere_com_wsgi.py`)
2. Substitua TODO o conteúdo pelo conteúdo do arquivo `pythonanywhere_wsgi.py` deste projeto
3. **IMPORTANTE**: Atualize o caminho no arquivo WSGI:
   ```python
   path = '/home/yourusername/MAG'
   ```
   Substitua `yourusername` pelo seu nome de usuário do PythonAnywhere

### 9. Configurar Virtual Environment

Na aba "Web", na seção "Virtualenv":

1. Insira o caminho: `/home/yourusername/.virtualenvs/mag_player`
2. Substitua `yourusername` pelo seu nome de usuário

### 10. Configurar Diretórios Estáticos

Na aba "Web", na seção "Static files":

Adicione duas entradas:

| URL      | Directory                          |
| -------- | ---------------------------------- |
| /static/ | /home/yourusername/MAG/staticfiles |
| /media/  | /home/yourusername/MAG/media       |

Substitua `yourusername` pelo seu nome de usuário.

### 11. Configurar Settings.py

Edite o arquivo `mag_player/settings.py`:

```python
# Para produção, configure:
DEBUG = False

ALLOWED_HOSTS = ["yourusername.pythonanywhere.com"]

CSRF_TRUSTED_ORIGINS = [
    "https://yourusername.pythonanywhere.com",
]

# Ative HTTPS em produção
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
```

### 12. Recarregar a Aplicação

Na aba "Web", clique no botão verde **"Reload"** para aplicar as mudanças.

### 13. Acessar a Aplicação

Acesse: `https://yourusername.pythonanywhere.com`

## Comandos Úteis

### Atualizar Código do GitHub

```bash
cd ~/MAG
git pull origin main
workon mag_player
python manage.py migrate
python manage.py collectstatic --noinput
```

Depois, recarregue a aplicação no dashboard Web.

### Ver Logs de Erro

No dashboard, aba "Web" → "Log files":

- Error log: mostra erros da aplicação
- Server log: mostra logs do servidor

### Acessar Console Python com Django

```bash
cd ~/MAG
workon mag_player
python manage.py shell
```

## Configurações de Segurança Importantes

### Para Produção (OBRIGATÓRIO):

1. **Atualize a SECRET_KEY** em `settings.py` para uma chave única e segura
2. **Configure DEBUG = False**
3. **Configure ALLOWED_HOSTS** com seu domínio
4. **Ative cookies seguros** (CSRF_COOKIE_SECURE e SESSION_COOKIE_SECURE = True)

### Gerar Nova SECRET_KEY

No console Bash:

```bash
cd ~/MAG
workon mag_player
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copie a chave gerada e substitua no `settings.py`.

## Limitações da Conta Gratuita

- 1 web app
- 512 MB de espaço em disco
- Tráfego limitado
- Site "dorme" após período de inatividade (precisa ser reativado manualmente)
- Sem HTTPS customizado (apenas subdomínio .pythonanywhere.com)

## Upgrade para Conta Paga

Para remover limitações:

- Múltiplos web apps
- Mais espaço em disco
- Domínio customizado com HTTPS
- Sem "sleep" do site
- Mais CPU e memória

Visite: [https://www.pythonanywhere.com/pricing/](https://www.pythonanywhere.com/pricing/)

## Solução de Problemas

### Erro 502 Bad Gateway

- Verifique o arquivo WSGI
- Confirme que o virtualenv está configurado corretamente
- Verifique os logs de erro

### Arquivos estáticos não carregam

- Rode `python manage.py collectstatic`
- Verifique as configurações de Static files na aba Web
- Confirme os caminhos dos diretórios

### Import Error

- Verifique se todas as dependências foram instaladas
- Confirme que o virtualenv correto está ativo
- Rode `pip install -r requirements.txt` novamente

### Banco de dados não funciona

- Rode `python manage.py migrate`
- Verifique permissões do arquivo `db.sqlite3`

## Suporte

Para mais ajuda, consulte a documentação oficial:

- [PythonAnywhere Django Tutorial](https://help.pythonanywhere.com/pages/DeployExistingDjangoProject/)
- [PythonAnywhere Help](https://help.pythonanywhere.com/)

---

**Última atualização**: 15 de novembro de 2025
