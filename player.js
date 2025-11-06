// Verificar se está logado
if (localStorage.getItem('magPlayerLogado') !== 'true') {
    window.location.href = 'index.html';
}

// Elementos do DOM
const fileInput = document.getElementById('fileInput');
const openBtn = document.getElementById('openBtn');
const playPauseBtn = document.getElementById('playPauseBtn');
const rewindBtn = document.getElementById('rewindBtn');
const forwardBtn = document.getElementById('forwardBtn');
const audioPlayer = document.getElementById('audioPlayer');
const currentTime = document.getElementById('currentTime');
const duration = document.getElementById('duration');
const progress = document.getElementById('progress');
const progressBar = document.querySelector('.progress-bar');
const logoutBtn = document.getElementById('logoutBtn');
const playPauseIcon = document.getElementById('playPauseIcon');

const songTitle = document.getElementById('songTitle');
const cassettePlayer = document.querySelector('.cassette-player');

// Elementos das fitas para controle do progresso
const tape1Main = document.getElementById('tape1-main');
const tape1Ring1 = document.getElementById('tape1-ring1');
const tape1Ring2 = document.getElementById('tape1-ring2');
const tape1Ring3 = document.getElementById('tape1-ring3');
const tape2Main = document.getElementById('tape2-main');
const tape2Ring1 = document.getElementById('tape2-ring1');
const tape2Ring2 = document.getElementById('tape2-ring2');
const tape2Ring3 = document.getElementById('tape2-ring3');

let isDragging = false;
let isPlaying = false;

// Configurações das fitas
const tapeConfig = {
    tape1: {
        maxRadius: { main: 160, ring1: 140, ring2: 120, ring3: 100 },
        minRadius: { main: 85, ring1: 65, ring2: 45, ring3: 25 }
    },
    tape2: {
        maxRadius: { main: 160, ring1: 140, ring2: 120, ring3: 100 },
        minRadius: { main: 85, ring1: 65, ring2: 45, ring3: 25 }
    }
};

// Botão de abrir arquivo
openBtn.addEventListener('click', function() {
    fileInput.click();
});

// Quando um arquivo é selecionado
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        // Verificar se o arquivo tem extensão .mag
        if (!file.name.toLowerCase().endsWith('.mag')) {
            alert('Por favor, selecione um arquivo .mag');
            return;
        }
        
        // Criar uma nova URL para o arquivo
        const fileURL = URL.createObjectURL(file);
        
        // Configurar o audio player
        audioPlayer.src = fileURL;
        audioPlayer.load();
        
        // Mostrar o nome do arquivo no label do cassette
        const fileName = file.name.replace('.mag', '');
        songTitle.textContent = fileName;
        
        // Habilitar botões
        playPauseBtn.disabled = false;
        rewindBtn.disabled = false;
        forwardBtn.disabled = false;
        
        // Reset do progresso
        progress.style.width = '0%';
        currentTime.textContent = '00:00';
        duration.textContent = '00:00';
        
        // Reset das fitas para posição inicial
        updateTapeProgress(0);
        
        // Reset do estado
        isPlaying = false;
        updatePlayButton();
        cassettePlayer.classList.remove('playing');
    }
});

// Botão de play/pause
playPauseBtn.addEventListener('click', function() {
    if (audioPlayer.src) {
        if (isPlaying) {
            audioPlayer.pause();
        } else {
            audioPlayer.play().then(() => {
                // Play bem-sucedido
            }).catch(error => {
                console.error('Erro ao reproduzir:', error);
                alert('Erro ao reproduzir o arquivo. Verifique se é um arquivo de áudio válido.');
            });
        }
    }
});

// Botão de retroceder 10 segundos
rewindBtn.addEventListener('click', function() {
    if (audioPlayer.src) {
        audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
    }
});

// Botão de avançar 10 segundos
forwardBtn.addEventListener('click', function() {
    if (audioPlayer.src && audioPlayer.duration) {
        audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
    }
});

// Função para atualizar o botão de play/pause
function updatePlayButton() {
    if (isPlaying) {
        playPauseIcon.className = 'fas fa-pause';
        playPauseBtn.classList.add('pause');
        cassettePlayer.classList.add('playing');
    } else {
        playPauseIcon.className = 'fas fa-play';
        playPauseBtn.classList.remove('pause');
        cassettePlayer.classList.remove('playing');
    }
}

// Event listeners do audio
audioPlayer.addEventListener('loadedmetadata', function() {
    duration.textContent = formatTime(audioPlayer.duration);
});

audioPlayer.addEventListener('timeupdate', function() {
    if (!isDragging) {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progress.style.width = percent + '%';
        currentTime.textContent = formatTime(audioPlayer.currentTime);
        
        // Atualizar o progresso das fitas
        updateTapeProgress(percent);
    }
});

audioPlayer.addEventListener('ended', function() {
    isPlaying = false;
    updatePlayButton();
    progress.style.width = '0%';
    audioPlayer.currentTime = 0;
    
    // Resetar as fitas para posição inicial
    updateTapeProgress(0);
});

audioPlayer.addEventListener('play', function() {
    isPlaying = true;
    updatePlayButton();
});

audioPlayer.addEventListener('pause', function() {
    isPlaying = false;
    updatePlayButton();
});

// Controle da barra de progresso
progressBar.addEventListener('click', function(e) {
    if (audioPlayer.src && audioPlayer.duration) {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const progressPercent = percent * 100;
        
        audioPlayer.currentTime = percent * audioPlayer.duration;
        
        // Atualizar o progresso das fitas imediatamente
        updateTapeProgress(progressPercent);
    }
});

// Drag para a barra de progresso
progressBar.addEventListener('mousedown', function(e) {
    isDragging = true;
    updateProgressFromMouse(e);
});

document.addEventListener('mousemove', function(e) {
    if (isDragging) {
        updateProgressFromMouse(e);
    }
});

document.addEventListener('mouseup', function() {
    isDragging = false;
});

// Touch events para dispositivos móveis
progressBar.addEventListener('touchstart', function(e) {
    isDragging = true;
    updateProgressFromTouch(e);
});

document.addEventListener('touchmove', function(e) {
    if (isDragging) {
        e.preventDefault();
        updateProgressFromTouch(e);
    }
});

document.addEventListener('touchend', function() {
    isDragging = false;
});

function updateProgressFromMouse(e) {
    if (audioPlayer.src && audioPlayer.duration) {
        const rect = progressBar.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        
        const progressPercent = percent * 100;
        progress.style.width = progressPercent + '%';
        audioPlayer.currentTime = percent * audioPlayer.duration;
        currentTime.textContent = formatTime(audioPlayer.currentTime);
        
        // Atualizar o progresso das fitas durante o drag
        updateTapeProgress(progressPercent);
    }
}

function updateProgressFromTouch(e) {
    if (audioPlayer.src && audioPlayer.duration) {
        const rect = progressBar.getBoundingClientRect();
        const touch = e.touches[0];
        let percent = (touch.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
        
        const progressPercent = percent * 100;
        progress.style.width = progressPercent + '%';
        audioPlayer.currentTime = percent * audioPlayer.duration;
        currentTime.textContent = formatTime(audioPlayer.currentTime);
        
        // Atualizar o progresso das fitas durante o touch
        updateTapeProgress(progressPercent);
    }
}

// Função para formatar tempo
function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Função para atualizar o progresso das fitas baseado no progresso do áudio
function updateTapeProgress(progressPercent) {
    if (!audioPlayer.duration) return;
    
    // Calcular os novos raios baseados no progresso
    // Fita 1 (esquerda) diminui conforme o progresso avança
    const tape1Progress = 1 - (progressPercent / 100);
    const tape1MainRadius = tapeConfig.tape1.minRadius.main + 
        (tapeConfig.tape1.maxRadius.main - tapeConfig.tape1.minRadius.main) * tape1Progress;
    const tape1Ring1Radius = tapeConfig.tape1.minRadius.ring1 + 
        (tapeConfig.tape1.maxRadius.ring1 - tapeConfig.tape1.minRadius.ring1) * tape1Progress;
    const tape1Ring2Radius = tapeConfig.tape1.minRadius.ring2 + 
        (tapeConfig.tape1.maxRadius.ring2 - tapeConfig.tape1.minRadius.ring2) * tape1Progress;
    const tape1Ring3Radius = tapeConfig.tape1.minRadius.ring3 + 
        (tapeConfig.tape1.maxRadius.ring3 - tapeConfig.tape1.minRadius.ring3) * tape1Progress;
    
    // Fita 2 (direita) aumenta conforme o progresso avança
    const tape2Progress = progressPercent / 100;
    const tape2MainRadius = tapeConfig.tape2.minRadius.main + 
        (tapeConfig.tape2.maxRadius.main - tapeConfig.tape2.minRadius.main) * tape2Progress;
    const tape2Ring1Radius = tapeConfig.tape2.minRadius.ring1 + 
        (tapeConfig.tape2.maxRadius.ring1 - tapeConfig.tape2.minRadius.ring1) * tape2Progress;
    const tape2Ring2Radius = tapeConfig.tape2.minRadius.ring2 + 
        (tapeConfig.tape2.maxRadius.ring2 - tapeConfig.tape2.minRadius.ring2) * tape2Progress;
    const tape2Ring3Radius = tapeConfig.tape2.minRadius.ring3 + 
        (tapeConfig.tape2.maxRadius.ring3 - tapeConfig.tape2.minRadius.ring3) * tape2Progress;
    
    // Aplicar os novos raios
    if (tape1Main) tape1Main.setAttribute('r', tape1MainRadius);
    if (tape1Ring1) tape1Ring1.setAttribute('r', tape1Ring1Radius);
    if (tape1Ring2) tape1Ring2.setAttribute('r', tape1Ring2Radius);
    if (tape1Ring3) tape1Ring3.setAttribute('r', tape1Ring3Radius);
    
    if (tape2Main) tape2Main.setAttribute('r', tape2MainRadius);
    if (tape2Ring1) tape2Ring1.setAttribute('r', tape2Ring1Radius);
    if (tape2Ring2) tape2Ring2.setAttribute('r', tape2Ring2Radius);
    if (tape2Ring3) tape2Ring3.setAttribute('r', tape2Ring3Radius);
}

// Botão de logout
logoutBtn.addEventListener('click', function() {
    // Parar o áudio se estiver tocando
    audioPlayer.pause();
    audioPlayer.src = '';
    
    // Limpar o localStorage
    localStorage.removeItem('magPlayerLogado');
    
    // Redirecionar para login
    window.location.href = 'index.html';
});

// Teclas de atalho
document.addEventListener('keydown', function(e) {
    if (audioPlayer.src) {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                playPauseBtn.click();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                rewindBtn.click();
                break;
            case 'ArrowRight':
                e.preventDefault();
                forwardBtn.click();
                break;
        }
    }
});

// Prevenir que o usuário saia sem querer
window.addEventListener('beforeunload', function(e) {
    if (isPlaying) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Garantir que os botões estejam no estado correto
    playPauseBtn.disabled = true;
    rewindBtn.disabled = true;
    forwardBtn.disabled = true;
    updatePlayButton();
});