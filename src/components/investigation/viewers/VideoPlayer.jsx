import React, { useRef, useState } from "react";
import { X, Download, Play, Pause, Maximize, Minimize } from "lucide-react";
import Button from "../../common/Button";

const VideoPlayer = ({ file, onClose }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handlePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      videoRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = file.file_url;
    link.download = file.file_name;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
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
              onClick={toggleFullscreen}
              icon={
                isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />
              }
            />
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

        {/* Video Player */}
        <div className="flex-1 bg-black flex items-center justify-center p-4">
          <video
            ref={videoRef}
            src={file.file_url}
            controls
            className="max-w-full max-h-full rounded"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            Seu navegador não suporta a tag de vídeo.
          </video>
        </div>

        {/* Info */}
        {file.description && (
          <div className="p-4 border-t border-border bg-background/50">
            <p className="text-textMuted text-sm">{file.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
