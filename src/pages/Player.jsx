import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  isAuthenticated,
  getUserData,
  clearAuth,
  getSessionInfo,
} from "../utils/auth";
import {
  processMagFile,
  validateMagFile,
  getMagFileInfo,
  saveProcessedMag,
} from "../../utils/magProcessor";

export default function Player() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [mostrarInfo, setMostrarInfo] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [magInfo, setMagInfo] = useState(null);
  const [currentAudioList, setCurrentAudioList] = useState([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);

  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const progressBarRef = useRef(null);
  const cassetteRef = useRef(null);
  const tape1MainRef = useRef(null);
  const tape1Ring1Ref = useRef(null);
  const tape1Ring2Ref = useRef(null);
  const tape1Ring3Ref = useRef(null);
  const tape2MainRef = useRef(null);
  const tape2Ring1Ref = useRef(null);
  const tape2Ring2Ref = useRef(null);
  const tape2Ring3Ref = useRef(null);
  const songTitleRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState("00:00");
  const [total, setTotal] = useState("00:00");

  useEffect(() => {
    document.title = "MAG Player - Reprodutor";
    if (!isAuthenticated()) {
      navigate("/", { replace: true });
    } else {
      const userData = getUserData();
      setUsuario(userData);
    }
  }, [navigate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => setTotal(formatTime(audio.duration));
    const onTime = () => {
      if (!isDragging) {
        const duration = audio.duration;
        if (!duration || !Number.isFinite(duration)) return;
        const percent = (audio.currentTime / duration) * 100;
        if (progressRef.current)
          progressRef.current.style.width = percent + "%";
        setCurrent(formatTime(audio.currentTime));
        updateTapeProgress(percent);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      if (progressRef.current) progressRef.current.style.width = "0%";
      audio.currentTime = 0;
      updateTapeProgress(0);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [isDragging]);

  function openFile() {
    fileInputRef.current?.click();
  }

  async function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".mag")) {
      alert("Por favor, selecione um arquivo .mag");
      return;
    }

    setProcessando(true);
    setMagInfo(null);

    try {
      const isValid = await validateMagFile(file);
      if (!isValid) {
        alert("Arquivo .mag inválido ou corrompido");
        setProcessando(false);
        return;
      }

      const info = await getMagFileInfo(file);
      setMagInfo(info);

      const result = await processMagFile(file);
      if (!result.success) {
        alert(`Erro ao processar arquivo: ${result.error}`);
        setProcessando(false);
        return;
      }
      if (result.audioFiles && result.audioFiles.length > 0) {
        setCurrentAudioList(result.audioFiles);
        setCurrentAudioIndex(0);
        loadAudio(result.audioFiles[0]);
        try {
          saveProcessedMag(result);
        } catch (e) {
          console.warn("Falha ao salvar histórico local:", e);
        }
        alert(
          `✅ Arquivo processado localmente!\n\n` +
            `📁 ${info.fileName}\n` +
            `🎵 ${result.audioFiles.length} áudio(s)\n` +
            `📝 ${result.markdownFiles.length} markdown(s)`
        );
      } else {
        alert(
          `Arquivo processado localmente com sucesso!\nNenhum áudio encontrado.`
        );
      }
    } catch (error) {
      console.error("Erro ao processar .mag:", error);
      alert(`Erro ao processar arquivo: ${error.message}`);
    } finally {
      setProcessando(false);
    }
  }

  function loadAudio(audioData) {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = audioData.blobUrl;
    audio.load();

    if (songTitleRef.current) {
      songTitleRef.current.textContent = audioData.fileName;
    }

    if (progressRef.current) progressRef.current.style.width = "0%";
    setCurrent("00:00");
    setTotal("00:00");
    setIsPlaying(false);
    cassetteRef.current?.classList.remove("playing");
    updateTapeProgress(0);
  }

  function playNext() {
    if (currentAudioList.length === 0) return;
    const nextIndex = (currentAudioIndex + 1) % currentAudioList.length;
    setCurrentAudioIndex(nextIndex);
    loadAudio(currentAudioList[nextIndex]);
    setTimeout(() => {
      audioRef.current?.play();
    }, 100);
  }

  function playPrevious() {
    if (currentAudioList.length === 0) return;
    const prevIndex =
      currentAudioIndex === 0
        ? currentAudioList.length - 1
        : currentAudioIndex - 1;
    setCurrentAudioIndex(prevIndex);
    loadAudio(currentAudioList[prevIndex]);
    setTimeout(() => {
      audioRef.current?.play();
    }, 100);
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    if (isPlaying) audio.pause();
    else audio.play().catch(() => alert("Erro ao reproduzir o arquivo."));
  }

  function seekFromClientX(clientX) {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    let percent = (clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    audio.currentTime = percent * audio.duration;
    if (progressRef.current)
      progressRef.current.style.width = percent * 100 + "%";
    setCurrent(formatTime(audio.currentTime));
    updateTapeProgress(percent * 100);
  }

  function rewind10() {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  }
  function forward10() {
    const audio = audioRef.current;
    if (!audio || !audio.src || !audio.duration) return;
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
  }

  function onProgressMouseDown(e) {
    setIsDragging(true);
    seekFromClientX(e.clientX);
  }
  function onMouseMove(e) {
    if (isDragging) seekFromClientX(e.clientX);
  }
  function onMouseUp() {
    if (isDragging) setIsDragging(false);
  }

  function onTouchStart(e) {
    setIsDragging(true);
    const t = e.touches[0];
    seekFromClientX(t.clientX);
  }
  function onTouchMove(e) {
    if (!isDragging) return;
    const t = e.touches[0];
    seekFromClientX(t.clientX);
  }
  function onTouchEnd() {
    setIsDragging(false);
  }

  useEffect(() => {
    if (cassetteRef.current) {
      if (isPlaying) cassetteRef.current.classList.add("playing");
      else cassetteRef.current.classList.remove("playing");
    }
  }, [isPlaying]);

  useEffect(() => {
    function onKey(e) {
      if (
        e.target &&
        (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        rewind10();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        forward10();
      } else if (e.key.toLowerCase() === "o") {
        e.preventDefault();
        openFile();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPlaying]);

  const tapeConfig = {
    tape1: {
      max: { main: 160, r1: 140, r2: 120, r3: 100 },
      min: { main: 85, r1: 65, r2: 45, r3: 25 },
    },
    tape2: {
      max: { main: 160, r1: 140, r2: 120, r3: 100 },
      min: { main: 85, r1: 65, r2: 45, r3: 25 },
    },
  };

  function updateTapeProgress(percent) {
    if (percent == null) return;
    if (!Number.isFinite(percent)) percent = 0;
    const leftP = 1 - percent / 100;
    const rightP = percent / 100;
    if (tape1MainRef.current)
      tape1MainRef.current.setAttribute(
        "r",
        (
          tapeConfig.tape1.min.main +
          (tapeConfig.tape1.max.main - tapeConfig.tape1.min.main) * leftP
        ).toString()
      );
    if (tape1Ring1Ref.current)
      tape1Ring1Ref.current.setAttribute(
        "r",
        (
          tapeConfig.tape1.min.r1 +
          (tapeConfig.tape1.max.r1 - tapeConfig.tape1.min.r1) * leftP
        ).toString()
      );
    if (tape1Ring2Ref.current)
      tape1Ring2Ref.current.setAttribute(
        "r",
        (
          tapeConfig.tape1.min.r2 +
          (tapeConfig.tape1.max.r2 - tapeConfig.tape1.min.r2) * leftP
        ).toString()
      );
    if (tape1Ring3Ref.current)
      tape1Ring3Ref.current.setAttribute(
        "r",
        (
          tapeConfig.tape1.min.r3 +
          (tapeConfig.tape1.max.r3 - tapeConfig.tape1.min.r3) * leftP
        ).toString()
      );
    if (tape2MainRef.current)
      tape2MainRef.current.setAttribute(
        "r",
        (
          tapeConfig.tape2.min.main +
          (tapeConfig.tape2.max.main - tapeConfig.tape2.min.main) * rightP
        ).toString()
      );
    if (tape2Ring1Ref.current)
      tape2Ring1Ref.current.setAttribute(
        "r",
        (
          tapeConfig.tape2.min.r1 +
          (tapeConfig.tape2.max.r1 - tapeConfig.tape2.min.r1) * rightP
        ).toString()
      );
    if (tape2Ring2Ref.current)
      tape2Ring2Ref.current.setAttribute(
        "r",
        (
          tapeConfig.tape2.min.r2 +
          (tapeConfig.tape2.max.r2 - tapeConfig.tape2.min.r2) * rightP
        ).toString()
      );
    if (tape2Ring3Ref.current)
      tape2Ring3Ref.current.setAttribute(
        "r",
        (
          tapeConfig.tape2.min.r3 +
          (tapeConfig.tape2.max.r3 - tapeConfig.tape2.min.r3) * rightP
        ).toString()
      );
  }

  function formatTime(seconds) {
    if (!seconds || Number.isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  return (
    <div className="player-container">
      <div className="cassette-player" ref={cassetteRef}>
        <div className="cassette-container">
          {/* SVG e UI mantidos do Next.js */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 810 513.5"
            className="cassette-svg"
          >
            <defs>
              <filter
                id="subtleBlueGlow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feColorMatrix
                  type="matrix"
                  values="0.1 0.1 0.3 0 0.05  0.1 0.2 0.4 0 0.1   0.2 0.3 0.6 0 0.15  0   0   0   1 0"
                  result="blueish"
                />
                <feGaussianBlur in="blueish" stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g id="Tape">
              <g id="Tape1">
                <g id="TapeReel">
                  <circle
                    cx="234"
                    cy="234"
                    r="160"
                    fill="#1a1a1a"
                    className="tape-reel tape1-main"
                    ref={tape1MainRef}
                  ></circle>
                  <circle
                    cx="234"
                    cy="234"
                    r="140"
                    stroke="#333"
                    fill="none"
                    className="tape-reel tape1-ring1"
                    ref={tape1Ring1Ref}
                  ></circle>
                  <circle
                    cx="234"
                    cy="234"
                    r="120"
                    stroke="#333"
                    fill="none"
                    className="tape-reel tape1-ring2"
                    ref={tape1Ring2Ref}
                  ></circle>
                  <circle
                    cx="234"
                    cy="234"
                    r="100"
                    stroke="#333"
                    fill="none"
                    className="tape-reel tape1-ring3"
                    ref={tape1Ring3Ref}
                  ></circle>
                </g>
                <circle cx="234" cy="234" r="86.05" fill="#f2f2f2" />
                <circle cx="234" cy="234" r="40.49" fill="#bfbfbf" />
                <rect
                  x="246.52"
                  y="198.18"
                  width="10.12"
                  height="10.12"
                  transform="translate(133.98 -98.04) rotate(29.74)"
                  fill="#f2f2f2"
                />
                <rect
                  x="211.36"
                  y="259.7"
                  width="10.12"
                  height="10.12"
                  transform="translate(159.87 -72.49) rotate(29.74)"
                  fill="#f2f2f2"
                />
                <rect
                  x="264.37"
                  y="228.74"
                  width="10.12"
                  height="10.12"
                  transform="translate(501.7 -36.95) rotate(89.68)"
                  fill="#f2f2f2"
                />
                <rect
                  x="193.51"
                  y="229.14"
                  width="10.12"
                  height="10.12"
                  transform="translate(431.64 34.31) rotate(89.68)"
                  fill="#f2f2f2"
                />
                <rect
                  x="210.95"
                  y="198.41"
                  width="10.12"
                  height="10.12"
                  transform="translate(-73.39 137.84) rotate(-30.51)"
                  fill="#f2f2f2"
                />
                <rect
                  x="246.93"
                  y="259.46"
                  width="10.12"
                  height="10.12"
                  transform="translate(-99.41 164.56) rotate(-30.51)"
                  fill="#f2f2f2"
                />
                <circle cx="234" cy="234" r="24.18" fill="#1a1a1a" />
                <polygon
                  points="234 198.38 203.15 251.81 264.85 251.81 234 198.38"
                  fill="#1a1a1a"
                />
                <line
                  x1="234"
                  y1="198.38"
                  x2="234"
                  y2="234"
                  fill="none"
                  stroke="#f2f2f2"
                  strokeMiterlimit="10"
                />
                <line
                  x1="203.15"
                  y1="251.81"
                  x2="234"
                  y2="234"
                  fill="none"
                  stroke="#f2f2f2"
                  strokeMiterlimit="10"
                />
                <line
                  x1="264.85"
                  y1="251.81"
                  x2="234"
                  y2="234"
                  fill="none"
                  stroke="#f2f2f2"
                  strokeMiterlimit="10"
                />
              </g>
              <g id="Tape2">
                <g id="TapeReel2">
                  <circle
                    cx="576"
                    cy="234"
                    r="85"
                    fill="#1a1a1a"
                    className="tape-reel tape2-main"
                    ref={tape2MainRef}
                  ></circle>
                  <circle
                    cx="576"
                    cy="234"
                    r="65"
                    stroke="#333"
                    fill="none"
                    className="tape-reel tape2-ring1"
                    ref={tape2Ring1Ref}
                  ></circle>
                  <circle
                    cx="576"
                    cy="234"
                    r="45"
                    stroke="#333"
                    fill="none"
                    className="tape-reel tape2-ring2"
                    ref={tape2Ring2Ref}
                  ></circle>
                  <circle
                    cx="576"
                    cy="234"
                    r="25"
                    stroke="#333"
                    fill="none"
                    className="tape-reel tape2-ring3"
                    ref={tape2Ring3Ref}
                  ></circle>
                </g>
                <circle cx="576" cy="234" r="86.05" fill="#f2f2f2" />
                <circle cx="576" cy="234" r="40.49" fill="#bfbfbf" />
                <rect
                  x="588.52"
                  y="198.18"
                  width="10.12"
                  height="10.12"
                  transform="translate(179.04 -267.72) rotate(29.74)"
                  fill="#f2f2f2"
                />
                <rect
                  x="553.36"
                  y="259.7"
                  width="10.12"
                  height="10.12"
                  transform="translate(204.94 -242.17) rotate(29.74)"
                  fill="#f2f2f2"
                />
                <rect
                  x="606.37"
                  y="228.74"
                  width="10.12"
                  height="10.12"
                  transform="translate(841.77 -378.94) rotate(89.68)"
                  fill="#f2f2f2"
                />
                <rect
                  x="535.51"
                  y="229.14"
                  width="10.12"
                  height="10.12"
                  transform="translate(771.71 -307.68) rotate(89.68)"
                  fill="#f2f2f2"
                />
                <rect
                  x="552.95"
                  y="198.41"
                  width="10.12"
                  height="10.12"
                  transform="translate(-26.04 311.47) rotate(-30.51)"
                  fill="#f2f2f2"
                />
                <rect
                  x="588.93"
                  y="259.46"
                  width="10.12"
                  height="10.12"
                  transform="translate(-52.05 338.19) rotate(-30.51)"
                  fill="#f2f2f2"
                />
                <circle cx="576" cy="234" r="24.18" fill="#1a1a1a" />
                <polygon
                  points="576 198.38 545.15 251.81 606.85 251.81 576 198.38"
                  fill="#1a1a1a"
                />
                <line
                  x1="576"
                  y1="198.38"
                  x2="576"
                  y2="234"
                  fill="none"
                  stroke="#f2f2f2"
                  strokeMiterlimit="10"
                />
                <line
                  x1="545.15"
                  y1="251.81"
                  x2="576"
                  y2="234"
                  fill="none"
                  stroke="#f2f2f2"
                  strokeMiterlimit="10"
                />
                <line
                  x1="606.85"
                  y1="251.81"
                  x2="576"
                  y2="234"
                  fill="none"
                  stroke="#f2f2f2"
                  strokeMiterlimit="10"
                />
              </g>
            </g>
            <g id="Cassette">
              <path
                d="M780.41,0H29.59A20.59,20.59,0,0,0,9,20.59V483.41A20.59,20.59,0,0,0,29.59,504H780.41A20.59,20.59,0,0,0,801,483.41V20.59A20.59,20.59,0,0,0,780.41,0ZM297,189H513v90H297ZM220.5,486A13.5,13.5,0,1,1,234,472.5,13.49,13.49,0,0,1,220.5,486ZM234,279a45,45,0,1,1,45-45A45,45,0,0,1,234,279Zm58.5,198A13.5,13.5,0,1,1,306,463.5,13.49,13.49,0,0,1,292.5,477Zm225,0A13.5,13.5,0,1,1,531,463.5,13.49,13.49,0,0,1,517.5,477Zm72,9A13.5,13.5,0,1,1,603,472.5,13.49,13.49,0,0,1,589.5,486ZM576,279a45,45,0,1,1,45-45A45,45,0,0,1,576,279Z"
                fill="#2a2e32"
                filter="url(#subtleBlueGlow)"
              />
              <path
                d="M654.47,501.21,631.65,394.7a9.74,9.74,0,0,0-9.53-7.7H187.88a9.74,9.74,0,0,0-9.53,7.7L155.53,501.21A9.74,9.74,0,0,0,165.06,513H644.94A9.74,9.74,0,0,0,654.47,501.21ZM220.5,486A13.5,13.5,0,1,1,234,472.5,13.49,13.49,0,0,1,220.5,486Zm72-9A13.5,13.5,0,1,1,306,463.5,13.49,13.49,0,0,1,292.5,477Zm225,0A13.5,13.5,0,1,1,531,463.5,13.49,13.49,0,0,1,517.5,477Zm72,9A13.5,13.5,0,1,1,603,472.5,13.49,13.49,0,0,1,589.5,486Z"
                fill="#2a2e32"
                stroke="#c5d1d6"
                strokeMiterlimit="10"
                filter="url(#subtleBlueGlow)"
              />
              <rect
                x="297"
                y="189"
                width="216"
                height="90"
                fill="#2a2e32"
                opacity="0.67"
              />
              <rect y="288" width="18" height="144" rx="3.98" fill="#2a2e32" />
              <rect
                x="792"
                y="288"
                width="18"
                height="144"
                rx="3.98"
                fill="#2a2e32"
              />
            </g>
            <g id="Label">
              <path
                d="M45,36V369H765V36ZM648,297H162V171H648Z"
                fill="#bfbfbf"
              />
              <rect x="45" y="36" width="720" height="27" fill="#ec1d25" />
              <rect x="45" y="63" width="720" height="81" fill="#f2f2f2" />
              <rect x="45" y="315" width="720" height="54" fill="#1a1a1a" />
              <text
                x="405"
                y="55"
                textAnchor="middle"
                fill="white"
                fontFamily="Arial, sans-serif"
                fontSize="18"
                fontWeight="bold"
              >
                MAG PLAYER
              </text>
              <text
                x="405"
                y="110"
                textAnchor="middle"
                fill="#333"
                fontFamily="Arial, sans-serif"
                fontSize="12"
                id="songTitle"
                ref={songTitleRef}
              >
                Selecione um arquivo .mag
              </text>
              <text
                x="405"
                y="125"
                textAnchor="middle"
                fill="#666"
                fontFamily="Arial, sans-serif"
                fontSize="10"
                id="songInfo"
              >
                Reprodutor de Audio Digital
              </text>
            </g>
          </svg>
        </div>

        <div className="controls-panel">
          <input
            type="file"
            ref={fileInputRef}
            id="fileInput"
            accept=".mag"
            style={{ display: "none" }}
            onChange={onFileChange}
          />
          <div className="main-controls">
            <button
              className="minimal-btn open-btn"
              title="Abrir arquivo"
              onClick={openFile}
              disabled={processando}
            >
              <i className="fas fa-folder-open"></i>
            </button>
            {currentAudioList.length > 1 && (
              <button
                className="minimal-btn prev-track-btn"
                title="Faixa Anterior"
                onClick={playPrevious}
              >
                <i className="fas fa-step-backward"></i>
              </button>
            )}
            <button
              className="minimal-btn rewind-btn"
              title="Retroceder 10s"
              onClick={rewind10}
            >
              <i className="fas fa-backward-step"></i>
            </button>
            <button
              className={`minimal-btn play-btn ${isPlaying ? "pause" : ""}`}
              title="Play/Pause"
              onClick={togglePlay}
              disabled={processando}
            >
              <i
                className={`fas ${
                  processando
                    ? "fa-spinner fa-spin"
                    : isPlaying
                    ? "fa-pause"
                    : "fa-play"
                }`}
              ></i>
            </button>
            <button
              className="minimal-btn forward-btn"
              title="Avançar 10s"
              onClick={forward10}
            >
              <i className="fas fa-forward-step"></i>
            </button>
            {currentAudioList.length > 1 && (
              <button
                className="minimal-btn next-track-btn"
                title="Próxima Faixa"
                onClick={playNext}
              >
                <i className="fas fa-step-forward"></i>
              </button>
            )}
          </div>

          {currentAudioList.length > 1 && (
            <div className="playlist-info">
              <span>
                Faixa {currentAudioIndex + 1} de {currentAudioList.length}
              </span>
            </div>
          )}

          <div className="progress-section">
            <div className="time-display">
              <span id="currentTime">{current}</span>
              <div className="progress-container">
                <div
                  className="progress-bar"
                  ref={progressBarRef}
                  onMouseDown={onProgressMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseLeave={onMouseUp}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  <div
                    id="progress"
                    className="progress-fill"
                    ref={progressRef}
                  ></div>
                </div>
              </div>
              <span id="duration">{total}</span>
            </div>
          </div>

          <div className="bottom-controls">
            <button
              className="minimal-btn files-btn"
              title="Ver Arquivos"
              onClick={() => navigate("/files")}
            >
              <i className="fas fa-folder"></i>
            </button>
            <button
              className="minimal-btn info-btn"
              title="Informações do Usuário"
              onClick={() => setMostrarInfo(!mostrarInfo)}
            >
              <i className="fas fa-user-circle"></i>
            </button>
            <button
              className="minimal-btn logout-btn"
              title="Sair"
              onClick={() => {
                clearAuth();
                navigate("/");
              }}
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>

        {mostrarInfo && usuario && (
          <div className="user-info-panel">
            <div className="user-info-content">
              <button
                className="close-info"
                onClick={() => setMostrarInfo(false)}
              >
                ×
              </button>
              <h3>👤 Informações do Usuário</h3>
              <div className="info-item">
                <strong>Nome:</strong> {usuario.nome}
              </div>
              <div className="info-item">
                <strong>Email:</strong> {usuario.email}
              </div>
              <div className="info-item">
                <strong>Departamento:</strong> {usuario.departamento}
              </div>
              <div className="info-item">
                <strong>Perfil:</strong> {usuario.perfil}
              </div>
              <div className="info-item">
                <strong>Código:</strong> {usuario.codigo}
              </div>
              <div className="session-info">
                <p
                  style={{
                    fontSize: "0.85em",
                    color: "#666",
                    marginTop: "12px",
                  }}
                >
                  Sessão válida por {getSessionInfo()?.horasRestantes}h
                </p>
              </div>
            </div>
          </div>
        )}

        <audio ref={audioRef} preload="none" />
      </div>
    </div>
  );
}
