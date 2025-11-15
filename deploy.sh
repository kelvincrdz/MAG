#!/bin/bash
# Script de comandos rápidos para PythonAnywhere
# Salve este arquivo como: /home/nivelKdev/Mag/deploy.sh
# Torne executável: chmod +x /home/nivelKdev/Mag/deploy.sh

echo "🚀 Deploy MAG Player no PythonAnywhere"
echo "======================================="

# Ativa o ambiente virtual
source /home/nivelKdev/.virtualenvs/mag_env/bin/activate

# Vai para o diretório do projeto
cd /home/nivelKdev/Mag

# Atualiza o código (se estiver usando git)
echo "📥 Puxando atualizações do Git..."
git pull

# Instala/atualiza dependências
echo "📦 Instalando dependências..."
pip install -r requirements.txt

# Executa migrações
echo "🗄️  Aplicando migrações..."
python manage.py migrate

# Coleta arquivos estáticos
echo "📁 Coletando arquivos estáticos..."
python manage.py collectstatic --noinput

# Verifica o projeto
echo "✅ Verificando projeto..."
python manage.py check

echo ""
echo "✨ Deploy concluído!"
echo "🔄 Não esqueça de recarregar a aplicação no painel Web do PythonAnywhere!"
