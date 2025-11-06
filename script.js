// Código de acesso (você pode alterar este código)
const CODIGO_CORRETO = "MAG2025";

// Verificar se já está logado
if (localStorage.getItem('magPlayerLogado') === 'true') {
    window.location.href = 'player.html';
}

// Função de login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const codigo = document.getElementById('codigo').value;
    const errorMessage = document.getElementById('error-message');
    
    if (codigo === CODIGO_CORRETO) {
        // Login bem-sucedido
        localStorage.setItem('magPlayerLogado', 'true');
        window.location.href = 'player.html';
    } else {
        // Código incorreto
        errorMessage.textContent = 'Código incorreto. Tente novamente.';
        document.getElementById('codigo').value = '';
        document.getElementById('codigo').focus();
    }
});

// Limpar mensagem de erro quando começar a digitar
document.getElementById('codigo').addEventListener('input', function() {
    document.getElementById('error-message').textContent = '';
});