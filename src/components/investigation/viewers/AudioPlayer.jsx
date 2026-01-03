import React, { useRef, useState } from "react";
import {
  X,
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
} from "lucide-react";
import Button from "../../common/Button";

const AudioPlayer = ({ file, onClose }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    audioRef.current.volume = vol;
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    audioRef.current.muted = !isMuted;
  };

  const skip = (seconds) => {
    audioRef.current.currentTime += seconds;
  };

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    audioRef.current.playbackRate = rate;
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = file.file_url;
    link.download = file.file_name;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-surface border border-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-6 border-b border-border gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-text truncate">
              {file.file_name}
            </h2>
            {file.description && (
              <p className="text-xs sm:text-sm text-textMuted mt-1 line-clamp-2">
                {file.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button
              variant="icon"
              size="icon"
              onClick={handleDownload}
              icon={<Download size={20} />}
            />
            <Button
              variant="icon"
              size="icon"
              onClick={onClose}
              icon={<X size={20} />}
            />
          </div>
        </div>

        {/* Player */}
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Waveform Visual (simplified) */}
          <div className="h-20 sm:h-32 bg-background rounded-lg border border-border flex items-center justify-center">
            <div className="flex items-end gap-0.5 sm:gap-1 h-12 sm:h-20">
              {[...Array(40)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-primary rounded-t transition-all duration-150"
                  style={{
                    height: `${Math.random() * 100}%`,
                    opacity: (currentTime / duration) * 40 > i ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-primary
                [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex items-center justify-between text-sm text-textMuted font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 justify-center w-full sm:w-auto">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => skip(-10)}
                icon={<SkipBack size={16} />}
              >
                <span className="hidden sm:inline">-10s</span>
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={handlePlayPause}
                icon={isPlaying ? <Pause size={24} /> : <Play size={24} />}
              />

              <Button
                variant="secondary"
                size="sm"
                onClick={() => skip(10)}
                icon={<SkipForward size={16} />}
              >
                <span className="hidden sm:inline">+10s</span>
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <Button
                variant="icon"
                size="icon"
                onClick={toggleMute}
                icon={isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 sm:w-24 h-2 bg-background rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-primary"
              />
            </div>
          </div>

          {/* Playback Speed */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <span className="text-xs sm:text-sm text-textMuted">
              Velocidade:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => changePlaybackRate(rate)}
                  className={`
                    px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0
                    ${
                      playbackRate === rate
                        ? "bg-primary text-white"
                        : "bg-background text-textMuted hover:text-text"
                    }
                  `}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            src={file.file_url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
