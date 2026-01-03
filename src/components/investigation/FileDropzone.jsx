import React, { useState, useCallback } from "react";
import { Upload, FileText, Image, Video, Music, File, X } from "lucide-react";
import Button from "../common/Button";

const FileDropzone = ({
  onFilesSelected,
  multiple = true,
  accept,
  disabled,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleDragEnter = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [disabled]
  );

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  }, []);

  const handleFiles = (files) => {
    setSelectedFiles(files);
    onFilesSelected(files);
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
      return <Image size={24} className="text-blue-400" />;
    }
    if (["mp4", "webm", "mov", "avi"].includes(ext)) {
      return <Video size={24} className="text-purple-400" />;
    }
    if (["mp3", "wav", "ogg", "m4a"].includes(ext)) {
      return <Music size={24} className="text-green-400" />;
    }
    if (["md", "txt"].includes(ext)) {
      return <FileText size={24} className="text-yellow-400" />;
    }
    return <File size={24} className="text-gray-400" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 transition-all duration-200
          ${
            isDragging
              ? "border-primary bg-primary/10 scale-105"
              : "border-border hover:border-primary/50 hover:bg-surfaceHover"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <input
          type="file"
          id="file-upload"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center gap-4 pointer-events-none">
          <div
            className={`p-4 rounded-full ${
              isDragging ? "bg-primary/20" : "bg-surface"
            } transition-colors`}
          >
            <Upload
              size={48}
              className={
                isDragging ? "text-primary animate-bounce" : "text-primary"
              }
            />
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold text-text mb-2">
              {isDragging
                ? "Solte os arquivos aqui"
                : "Arraste e solte arquivos aqui"}
            </p>
            <p className="text-sm text-textMuted mb-2">
              {multiple
                ? "ou clique para selecionar múltiplos arquivos"
                : "ou clique para selecionar"}
            </p>
            <div className="flex flex-col gap-2 items-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                <FileText size={16} className="text-primary" />
                <span className="text-xs text-primary font-medium">
                  MD, TXT, PDF, Imagens, Áudio e Vídeo
                </span>
              </div>
              {multiple && (
                <span className="text-xs text-primary font-bold">
                  ✨ Suporta múltiplos arquivos simultaneamente
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview dos arquivos selecionados */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-text">
            {selectedFiles.length} arquivo{selectedFiles.length > 1 ? "s" : ""}{" "}
            selecionado{selectedFiles.length > 1 ? "s" : ""}
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-surface border border-border rounded-lg"
              >
                {getFileIcon(file.name)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-textMuted">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;
