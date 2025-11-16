# Guia de Deploy no AWS App Runner

## Configurações no Console AWS App Runner

### 1. Tempo de Execução

- **Runtime**: Python 3

### 2. Comando de Compilação

**Opção Simples (Recomendado):**

```bash
pip install -r requirements.txt
```

**Opção Completa:**

```bash
pip install --upgrade pip && pip install -r requirements.txt
```

> ⚠️ **Importante**: Evite executar `migrate` e `collectstatic` no comando de compilação. Execute-os no comando Start para garantir que as variáveis de ambiente estejam disponíveis.

### 3. Comando Start

```bash
python manage.py migrate --noinput && python manage.py collectstatic --noinput --clear && gunicorn --bind :8000 --workers 2 --threads 4 --timeout 60 --access-logfile - --error-logfile - mag_player.wsgi:application
```

Ou use o script `start.sh`:

```bash
./start.sh
```

### 4. Porta

```
8000
```

## Variáveis de Ambiente Necessárias

Configure estas variáveis de ambiente no console do App Runner:

| Variável                 | Valor                 | Descrição                                |
| ------------------------ | --------------------- | ---------------------------------------- |
| `SECRET_KEY`             | (gerar nova chave)    | Chave secreta do Django                  |
| `DEBUG`                  | `False`               | Modo debug (sempre False em produção)    |
| `ALLOWED_HOSTS`          | URL do seu app        | Ex: `seu-app.us-east-1.awsapprunner.com` |
| `DJANGO_SETTINGS_MODULE` | `mag_player.settings` | Módulo de settings do Django             |
| `PYTHONUNBUFFERED`       | `1`                   | Para logs em tempo real                  |
| `CSRF_COOKIE_SECURE`     | `True`                | Segurança CSRF                           |
| `SESSION_COOKIE_SECURE`  | `True`                | Segurança de sessão                      |

### Gerando uma SECRET_KEY segura

Execute no terminal:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## Usando o Arquivo apprunner.yaml (Recomendado)

Se você escolher "Usar um arquivo de configuração" no console:

1. O arquivo `apprunner.yaml` já está configurado na raiz do projeto
2. Você só precisa configurar as variáveis de ambiente no console
3. O App Runner lerá automaticamente as configurações de build e runtime do arquivo

## Configurações Adicionais Recomendadas

### Saúde e Monitoramento

- **Health check path**: `/` ou configure um endpoint específico
- **Health check interval**: 5 segundos
- **Health check timeout**: 2 segundos
- **Unhealthy threshold**: 3

### CPU e Memória

- **CPU**: 1 vCPU (mínimo)
- **Memory**: 2 GB (mínimo recomendado)

### Auto Scaling

- **Min instances**: 1
- **Max instances**: 3 (ajuste conforme necessário)

## Arquivos Estáticos e Media

O projeto usa WhiteNoise para servir arquivos estáticos. Para arquivos de mídia (uploads), considere:

1. **Amazon S3**: Para armazenamento de arquivos enviados pelos usuários
2. **Amazon EFS**: Para sistema de arquivos compartilhado entre instâncias

### Configurando S3 (Opcional)

Adicione ao `requirements.txt`:

```
boto3>=1.28.0
django-storages>=1.14.0
```

Adicione ao `settings.py`:

```python
# AWS S3 Settings (quando configurado)
if os.getenv('USE_S3') == 'True':
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME', 'us-east-1')
    AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'

    # Media files
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'
```

## Banco de Dados

O SQLite não é recomendado para produção. Considere migrar para:

### Amazon RDS (PostgreSQL)

Adicione ao `requirements.txt`:

```
psycopg2-binary>=2.9.0
```

Configure no `settings.py`:

```python
import dj_database_url

DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///db.sqlite3',
        conn_max_age=600
    )
}
```

Variável de ambiente:

```
DATABASE_URL=postgresql://user:password@endpoint.rds.amazonaws.com:5432/dbname
```

## Checklist de Deploy

- [ ] Arquivo `apprunner.yaml` commitado no repositório
- [ ] `gunicorn` adicionado ao `requirements.txt`
- [ ] SECRET_KEY gerada e configurada como variável de ambiente
- [ ] DEBUG=False configurado
- [ ] ALLOWED_HOSTS configurado com a URL do App Runner
- [ ] Variáveis de segurança (CSRF_COOKIE_SECURE, SESSION_COOKIE_SECURE) configuradas
- [ ] Migrations rodando automaticamente no build
- [ ] Static files sendo coletados automaticamente
- [ ] Health check configurado
- [ ] Auto scaling configurado
- [ ] (Opcional) S3 configurado para arquivos de mídia
- [ ] (Opcional) RDS configurado para banco de dados

## Comandos Úteis

### Testar localmente com Gunicorn

```bash
gunicorn --bind 127.0.0.1:8000 --workers 2 mag_player.wsgi:application
```

### Ver logs do App Runner

Use o console AWS ou AWS CLI:

```bash
aws apprunner list-operations --service-arn <seu-service-arn>
```

## Troubleshooting

### ❌ Erro: "Failed to build your application source code. Reason: Failed to execute 'build' command"

**Causa**: Comandos complexos ou dependências do sistema faltando no build.

**Soluções**:

1. **Simplifique o comando de build** - use apenas `pip install -r requirements.txt`
2. **Mova migrate e collectstatic para o comando Start** - eles precisam das variáveis de ambiente
3. **Use o arquivo apprunner.yaml** - está otimizado e testado
4. **Verifique requirements.txt** - certifique-se que não há dependências que precisam de compilação (como psycopg2 sem o sufixo -binary)

**Configuração Correta**:

```yaml
# Build (apenas instalar dependências)
pip install -r requirements.txt

# Start (executar migrations, collectstatic e servidor)
python manage.py migrate --noinput && python manage.py collectstatic --noinput --clear && gunicorn ...
```

### ❌ Erro 502 Bad Gateway

- Verifique os logs do App Runner
- Confirme que a porta 8000 está configurada corretamente
- Verifique se as migrations rodaram com sucesso
- Confirme que SECRET_KEY está configurada

### ❌ Static files não carregam

- Verifique se `collectstatic` rodou no comando Start
- Confirme que WhiteNoise está configurado no MIDDLEWARE
- Verifique se DEBUG=False (WhiteNoise só serve arquivos com DEBUG=False)

### ❌ Erro de CSRF

- Configure CSRF_TRUSTED_ORIGINS no settings.py com a URL do App Runner
- Verifique se CSRF_COOKIE_SECURE está True
- Adicione a variável de ambiente: `CSRF_TRUSTED_ORIGINS=https://sua-url.awsapprunner.com`

### ❌ Erro de ImportError ou ModuleNotFoundError

- Verifique se todas as dependências estão no `requirements.txt`
- Confirme que o build foi concluído com sucesso
- Use versões específicas em vez de `>=` quando possível

## Suporte

Para mais informações sobre o AWS App Runner:

- [Documentação oficial](https://docs.aws.amazon.com/apprunner/)
- [Guia de configuração Python](https://docs.aws.amazon.com/apprunner/latest/dg/service-source-code-python.html)
