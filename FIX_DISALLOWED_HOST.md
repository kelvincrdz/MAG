# 🔧 Correção Rápida - DisallowedHost Error

## ⚡ SOLUÇÃO RÁPIDA

O erro ocorre porque o Django precisa saber quais domínios estão autorizados a acessar sua aplicação.

### Opção 1: Atualizar o código no GitHub e fazer pull (RECOMENDADO)

Já atualizei o `settings.py` localmente. Agora você precisa:

```bash
# No seu computador local
git add .
git commit -m "Adiciona nivelkdev.pythonanywhere.com ao ALLOWED_HOSTS"
git push origin main

# No console do PythonAnywhere
cd /home/nivelKdev/Mag
git pull origin main
```

Depois, **recarregue a aplicação** no painel Web do PythonAnywhere.

### Opção 2: Editar diretamente no servidor (SOLUÇÃO IMEDIATA)

No console Bash do PythonAnywhere:

```bash
nano /home/nivelKdev/Mag/mag_player/settings.py
```

Encontre a linha `ALLOWED_HOSTS = []` e mude para:

```python
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'nivelkdev.pythonanywhere.com',
]
```

Salve com `Ctrl+O`, `Enter`, `Ctrl+X`.

Depois, **recarregue a aplicação** no painel Web.

---

## 📋 Mudanças Aplicadas no settings.py

As seguintes mudanças já foram feitas no código local e precisam ser enviadas ao servidor:

### 1. ALLOWED_HOSTS configurado:

```python
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'nivelkdev.pythonanywhere.com',
]
```

### 2. DEBUG dinâmico (para facilitar):

```python
DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'
```

### 3. STATIC_ROOT automático:

```python
if DEBUG:
    STATICFILES_DIRS = [BASE_DIR / 'static']
else:
    STATIC_ROOT = BASE_DIR / 'staticfiles'
```

---

## 🚀 Próximos Passos Após a Correção

1. ✅ Fazer commit e push do código atualizado
2. ✅ Pull no servidor PythonAnywhere
3. ✅ Recarregar aplicação no painel Web
4. 🔒 **IMPORTANTE**: Configurar variável de ambiente para desativar DEBUG em produção

### Desativar DEBUG em produção (SEGURANÇA):

No arquivo WSGI (`/var/www/nivelkdev_pythonanywhere_com_wsgi.py`), adicione antes de importar o Django:

```python
import os
os.environ['DJANGO_DEBUG'] = 'False'
```

Ou edite diretamente no servidor:

```bash
nano /home/nivelKdev/Mag/mag_player/settings.py
```

E mude manualmente para:

```python
DEBUG = False
```

---

## 🔄 Comandos Completos para Atualização

```bash
# 1. No seu computador Windows (PowerShell)
cd C:\Users\kelvi\Documents\GitHub\MAG
git add .
git commit -m "Corrige ALLOWED_HOSTS para PythonAnywhere"
git push origin main

# 2. No console Bash do PythonAnywhere
cd /home/nivelKdev/Mag
git pull origin main

# 3. Executar collectstatic (se necessário)
python manage.py collectstatic --noinput

# 4. Verificar configuração
python manage.py check --deploy
```

Depois clique em **Reload** no painel Web.

---

## ✅ Verificação

Após recarregar, acesse: https://nivelkdev.pythonanywhere.com

Se tudo estiver correto, você verá sua aplicação funcionando! 🎉
