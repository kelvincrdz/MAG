import React, { useState } from "react";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Button from "../../common/Button";

const ImageViewer = ({ file, onClose, onNavigate }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.25, 3));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.25, 0.5));
  const handleRotate = () => setRotation((rotation + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = file.file_url;
    link.download = file.file_name;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="bg-surface border-b border-border p-2 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-xl font-bold text-text truncate">
            {file.file_name}
          </h2>
          {file.description && (
            <p className="text-xs sm:text-sm text-textMuted mt-1 line-clamp-1 sm:line-clamp-2">
              {file.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
          {onNavigate && (
            <>
              <Button
                variant="icon"
                size="icon"
                onClick={() => onNavigate("previous")}
                icon={<ChevronLeft size={20} />}
              />
              <Button
                variant="icon"
                size="icon"
                onClick={() => onNavigate("next")}
                icon={<ChevronRight size={20} />}
              />
            </>
          )}
          <Button
            variant="icon"
            size="icon"
            onClick={handleZoomOut}
            icon={<ZoomOut size={20} />}
            disabled={zoom <= 0.5}
          />
          <span className="text-text font-mono text-sm w-16 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="icon"
            size="icon"
            onClick={handleZoomIn}
            icon={<ZoomIn size={20} />}
            disabled={zoom >= 3}
          />
          <Button
            variant="icon"
            size="icon"
            onClick={handleRotate}
            icon={<RotateCw size={20} />}
          />
          <Button
            variant="icon"
            size="icon"
            onClick={handleReset}
            icon={<Maximize size={20} />}
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

      {/* Image Container */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden bg-black/50"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
        }}
      >
        <img
          src={file.file_url}
          alt={file.file_name}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg) translate(${
              position.x / zoom
            }px, ${position.y / zoom}px)`,
            userSelect: "none",
            pointerEvents: "none",
          }}
          draggable={false}
        />
      </div>

      {/* Info Bar */}
      <div className="bg-surface border-t border-border p-2 sm:p-3 text-center text-textMuted text-xs sm:text-sm">
        <p className="truncate">
          {zoom > 1 ? "Arraste para mover" : "Use os controles"}
          <span className="hidden sm:inline">
            {zoom > 1 ? " a imagem" : " para zoom e rotação"}
            {" • Scroll do mouse para zoom rápido"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default ImageViewer;
