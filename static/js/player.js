// Elementos do DOM
const fileInput = document.getElementById("fileInput");
const openBtn = document.getElementById("openBtn");
const playPauseBtn = document.getElementById("playPauseBtn");
const rewindBtn = document.getElementById("rewindBtn");
const forwardBtn = document.getElementById("forwardBtn");
const audioPlayer = document.getElementById("audioPlayer");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const progress = document.getElementById("progress");
const progressBar = document.querySelector(".progress-bar");
const logoutBtn = document.getElementById("logoutBtn");
const playPauseIcon = document.getElementById("playPauseIcon");

const songTitle = document.getElementById("songTitle");
const cassettePlayer = document.querySelector(".cassette-player");
const trackSelect = document.getElementById("trackSelect");

// Elementos das fitas para controle do progresso
const tape1Main = document.getElementById("tape1-main");
const tape1Ring1 = document.getElementById("tape1-ring1");
const tape1Ring2 = document.getElementById("tape1-ring2");
const tape1Ring3 = document.getElementById("tape1-ring3");
const tape2Main = document.getElementById("tape2-main");
const tape2Ring1 = document.getElementById("tape2-ring1");
const tape2Ring2 = document.getElementById("tape2-ring2");
const tape2Ring3 = document.getElementById("tape2-ring3");

let isDragging = false;
let isPlaying = false;

// Configurações das fitas
const tapeConfig = {
  tape1: {
    maxRadius: { main: 160, ring1: 140, ring2: 120, ring3: 100 },
    minRadius: { main: 85, ring1: 65, ring2: 45, ring3: 25 },
  },
  tape2: {
    maxRadius: { main: 160, ring1: 140, ring2: 120, ring3: 100 },
    minRadius: { main: 85, ring1: 65, ring2: 45, ring3: 25 },
  },
};

// Botão de abrir arquivo (.mag -> upload)
if (openBtn) {
  openBtn.addEventListener("click", function () {
    const form = document.getElementById("uploadForm");
    if (!form) return;
    if (fileInput) fileInput.click();
  });
}

// Upload do arquivo .mag para o servidor
if (fileInput) {
  fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!(name.endsWith(".mag") || name.endsWith(".zip"))) {
      alert("Por favor, selecione um arquivo .mag");
      return;
    }
    const form = document.getElementById("uploadForm");
    if (form) {
      form.submit();
    }
  });
}

// Botão de play/pause
if (playPauseBtn) {
  playPauseBtn.addEventListener("click", function () {
    if (audioPlayer && audioPlayer.src) {
      if (isPlaying) {
        audioPlayer.pause();
      } else {
        audioPlayer
          .play()
          .then(() => {
            console.log("Reprodução iniciada com sucesso");
          })
          .catch((error) => {
            console.error("Erro ao reproduzir:", error);
            alert(
              "Erro ao reproduzir o arquivo. Verifique se é um arquivo de áudio válido."
            );
          });
      }
    }
  });
}

// Botão de retroceder 10 segundos
if (rewindBtn) {
  rewindBtn.addEventListener("click", function () {
    if (audioPlayer && audioPlayer.src) {
      audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
    }
  });
}

// Botão de avançar 10 segundos
if (forwardBtn) {
  forwardBtn.addEventListener("click", function () {
    if (audioPlayer && audioPlayer.src && audioPlayer.duration) {
      audioPlayer.currentTime = Math.min(
        audioPlayer.duration,
        audioPlayer.currentTime + 10
      );
    }
  });
}

// Função para atualizar o botão de play/pause
function updatePlayButton() {
  if (isPlaying) {
    playPauseIcon.className = "fas fa-pause";
    playPauseBtn.classList.add("pause");
    cassettePlayer.classList.add("playing");
  } else {
    playPauseIcon.className = "fas fa-play";
    playPauseBtn.classList.remove("pause");
    cassettePlayer.classList.remove("playing");
  }
}

// Event listeners do audio
if (audioPlayer) {
  audioPlayer.addEventListener("loadedmetadata", function () {
    console.log("Metadados carregados. Duração:", audioPlayer.duration);
    if (duration) {
      duration.textContent = formatTime(audioPlayer.duration);
    }
  });
}

if (audioPlayer) {
  audioPlayer.addEventListener("timeupdate", function () {
    if (!isDragging && audioPlayer.duration) {
      const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      if (progress) progress.style.width = percent + "%";
      if (currentTime)
        currentTime.textContent = formatTime(audioPlayer.currentTime);

      // Atualizar o progresso das fitas
      updateTapeProgress(percent);
    }
  });
}

if (audioPlayer) {
  audioPlayer.addEventListener("ended", function () {
    console.log("Áudio finalizado");
    // Se houver seletor de faixas, avançar para a próxima automaticamente
    if (trackSelect && trackSelect.options.length > 0) {
      const nextIndex = trackSelect.selectedIndex + 1;
      if (nextIndex < trackSelect.options.length) {
        setTrackByIndex(nextIndex, true);
        return;
      }
    }
    isPlaying = false;
    updatePlayButton();
    if (progress) progress.style.width = "0%";
    audioPlayer.currentTime = 0;
    updateTapeProgress(0);
  });

  audioPlayer.addEventListener("play", function () {
    console.log("Reprodução iniciada");
    isPlaying = true;
    updatePlayButton();
  });

  audioPlayer.addEventListener("pause", function () {
    console.log("Reprodução pausada");
    isPlaying = false;
    updatePlayButton();
  });
}

// Controle da barra de progresso
if (progressBar) {
  progressBar.addEventListener("click", function (e) {
    if (audioPlayer && audioPlayer.src && audioPlayer.duration) {
      const rect = progressBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const progressPercent = percent * 100;

      audioPlayer.currentTime = percent * audioPlayer.duration;

      // Atualizar o progresso das fitas imediatamente
      updateTapeProgress(progressPercent);
    }
  });

  // Drag para a barra de progresso
  progressBar.addEventListener("mousedown", function (e) {
    isDragging = true;
    updateProgressFromMouse(e);
  });

  // Touch events para dispositivos móveis
  progressBar.addEventListener("touchstart", function (e) {
    isDragging = true;
    updateProgressFromTouch(e);
  });
}

document.addEventListener("mousemove", function (e) {
  if (isDragging) {
    updateProgressFromMouse(e);
  }
});

document.addEventListener("mouseup", function () {
  isDragging = false;
});

document.addEventListener("touchmove", function (e) {
  if (isDragging) {
    e.preventDefault();
    updateProgressFromTouch(e);
  }
});

document.addEventListener("touchend", function () {
  isDragging = false;
});

function updateProgressFromMouse(e) {
  if (audioPlayer && audioPlayer.src && audioPlayer.duration && progressBar) {
    const rect = progressBar.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));

    const progressPercent = percent * 100;
    if (progress) progress.style.width = progressPercent + "%";
    audioPlayer.currentTime = percent * audioPlayer.duration;
    if (currentTime)
      currentTime.textContent = formatTime(audioPlayer.currentTime);

    // Atualizar o progresso das fitas durante o drag
    updateTapeProgress(progressPercent);
  }
}

function updateProgressFromTouch(e) {
  if (audioPlayer && audioPlayer.src && audioPlayer.duration && progressBar) {
    const rect = progressBar.getBoundingClientRect();
    const touch = e.touches[0];
    let percent = (touch.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));

    const progressPercent = percent * 100;
    if (progress) progress.style.width = progressPercent + "%";
    audioPlayer.currentTime = percent * audioPlayer.duration;
    if (currentTime)
      currentTime.textContent = formatTime(audioPlayer.currentTime);

    // Atualizar o progresso das fitas durante o touch
    updateTapeProgress(progressPercent);
  }
}

// Função para formatar tempo
function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

// Função para atualizar o progresso das fitas baseado no progresso do áudio
function updateTapeProgress(progressPercent) {
  if (!audioPlayer.duration) return;

  // Calcular os novos raios baseados no progresso
  // Fita 1 (esquerda) diminui conforme o progresso avança
  const tape1Progress = 1 - progressPercent / 100;
  const tape1MainRadius =
    tapeConfig.tape1.minRadius.main +
    (tapeConfig.tape1.maxRadius.main - tapeConfig.tape1.minRadius.main) *
      tape1Progress;
  const tape1Ring1Radius =
    tapeConfig.tape1.minRadius.ring1 +
    (tapeConfig.tape1.maxRadius.ring1 - tapeConfig.tape1.minRadius.ring1) *
      tape1Progress;
  const tape1Ring2Radius =
    tapeConfig.tape1.minRadius.ring2 +
    (tapeConfig.tape1.maxRadius.ring2 - tapeConfig.tape1.minRadius.ring2) *
      tape1Progress;
  const tape1Ring3Radius =
    tapeConfig.tape1.minRadius.ring3 +
    (tapeConfig.tape1.maxRadius.ring3 - tapeConfig.tape1.minRadius.ring3) *
      tape1Progress;

  // Fita 2 (direita) aumenta conforme o progresso avança
  const tape2Progress = progressPercent / 100;
  const tape2MainRadius =
    tapeConfig.tape2.minRadius.main +
    (tapeConfig.tape2.maxRadius.main - tapeConfig.tape2.minRadius.main) *
      tape2Progress;
  const tape2Ring1Radius =
    tapeConfig.tape2.minRadius.ring1 +
    (tapeConfig.tape2.maxRadius.ring1 - tapeConfig.tape2.minRadius.ring1) *
      tape2Progress;
  const tape2Ring2Radius =
    tapeConfig.tape2.minRadius.ring2 +
    (tapeConfig.tape2.maxRadius.ring2 - tapeConfig.tape2.minRadius.ring2) *
      tape2Progress;
  const tape2Ring3Radius =
    tapeConfig.tape2.minRadius.ring3 +
    (tapeConfig.tape2.maxRadius.ring3 - tapeConfig.tape2.minRadius.ring3) *
      tape2Progress;

  // Aplicar os novos raios
  if (tape1Main) tape1Main.setAttribute("r", tape1MainRadius);
  if (tape1Ring1) tape1Ring1.setAttribute("r", tape1Ring1Radius);
  if (tape1Ring2) tape1Ring2.setAttribute("r", tape1Ring2Radius);
  if (tape1Ring3) tape1Ring3.setAttribute("r", tape1Ring3Radius);

  if (tape2Main) tape2Main.setAttribute("r", tape2MainRadius);
  if (tape2Ring1) tape2Ring1.setAttribute("r", tape2Ring1Radius);
  if (tape2Ring2) tape2Ring2.setAttribute("r", tape2Ring2Radius);
  if (tape2Ring3) tape2Ring3.setAttribute("r", tape2Ring3Radius);
}

// Botão de logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    // Parar o áudio se estiver tocando
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.src = "";
    }

    // Redirecionar para logout
    window.location.href = "/logout/";
  });
}

// Teclas de atalho
document.addEventListener("keydown", function (e) {
  if (audioPlayer && audioPlayer.src) {
    switch (e.code) {
      case "Space":
        e.preventDefault();
        if (playPauseBtn) playPauseBtn.click();
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (rewindBtn) rewindBtn.click();
        break;
      case "ArrowRight":
        e.preventDefault();
        if (forwardBtn) forwardBtn.click();
        break;
    }
  }
});

// Prevenir que o usuário saia sem querer
window.addEventListener("beforeunload", function (e) {
  if (isPlaying) {
    e.preventDefault();
    e.returnValue = "";
  }
});

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  // Inicialização padrão
  if (playPauseBtn) {
    playPauseBtn.disabled = true;
  }
  if (rewindBtn) {
    rewindBtn.disabled = true;
  }
  if (forwardBtn) {
    forwardBtn.disabled = true;
  }
  updatePlayButton();

  // Se vier áudio inicial do servidor
  const initial = document.getElementById("initialData");
  if (initial) {
    const url = initial.getAttribute("data-audio-url");
    const title = initial.getAttribute("data-title") || "Depoimento";
    if (url) {
      console.log("Carregando áudio inicial:", url, title);
      setAudioSource(url, title);
    }
  }

  // Listener para o seletor de faixas (na página de arquivos)
  if (trackSelect) {
    trackSelect.addEventListener("change", function () {
      const opt = trackSelect.options[trackSelect.selectedIndex];
      if (opt) {
        console.log("Mudando para faixa:", opt.value, opt.text);
        setAudioSource(opt.value, opt.text, true);
      }
    });

    // Se há um seletor e há opções, carregar o primeiro áudio automaticamente
    if (trackSelect.options.length > 0 && !initial) {
      const firstOpt = trackSelect.options[0];
      console.log("Carregando primeira faixa:", firstOpt.value, firstOpt.text);
      setAudioSource(firstOpt.value, firstOpt.text);
    }
  }
});

function setAudioSource(url, title, autoplay = false) {
  console.log("setAudioSource chamado:", url, title, autoplay);

  if (!audioPlayer) {
    console.error("audioPlayer não encontrado!");
    return;
  }

  audioPlayer.pause();
  audioPlayer.src = url;
  audioPlayer.load();

  if (songTitle) {
    songTitle.textContent = title || "Áudio carregado";
  }

  if (playPauseBtn) playPauseBtn.disabled = false;
  if (rewindBtn) rewindBtn.disabled = false;
  if (forwardBtn) forwardBtn.disabled = false;

  if (progress) progress.style.width = "0%";
  if (currentTime) currentTime.textContent = "00:00";
  if (duration) duration.textContent = "00:00";

  updateTapeProgress(0);

  if (autoplay) {
    audioPlayer.play().catch((err) => {
      console.error("Erro ao reproduzir automaticamente:", err);
    });
  }

  console.log("Áudio configurado com sucesso:", audioPlayer.src);
}

function setTrackByIndex(index, autoplay = false) {
  if (!trackSelect) return;
  if (index < 0 || index >= trackSelect.options.length) return;
  trackSelect.selectedIndex = index;
  const opt = trackSelect.options[index];
  setAudioSource(opt.value, opt.text, autoplay);
}
