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
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-text">{file.file_name}</h2>
            {file.description && (
              <p className="text-sm text-textMuted mt-1">{file.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
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
        <div className="p-6 space-y-6">
          {/* Waveform Visual (simplified) */}
          <div className="h-32 bg-background rounded-lg border border-border flex items-center justify-center">
            <div className="flex items-end gap-1 h-20">
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => skip(-10)}
                icon={<SkipBack size={16} />}
              >
                -10s
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
                +10s
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Button
                variant="icon"
                size="icon"
                onClick={toggleMute}
                icon={isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-2 bg-background rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-primary"
              />
            </div>
          </div>

          {/* Playback Speed */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-textMuted">Velocidade:</span>
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
              <button
                key={rate}
                onClick={() => changePlaybackRate(rate)}
                className={`
                  px-3 py-1 rounded text-sm font-medium transition-colors
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
