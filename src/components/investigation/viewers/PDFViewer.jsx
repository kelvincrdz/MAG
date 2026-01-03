import React, { useState } from "react";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import Button from "../../common/Button";
import Input from "../../common/Input";

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({ file, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [searchText, setSearchText] = useState("");

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () => {
    setPageNumber(Math.max(1, pageNumber - 1));
  };

  const goToNextPage = () => {
    setPageNumber(Math.min(numPages, pageNumber + 1));
  };

  const handleZoomIn = () => {
    setScale(Math.min(scale + 0.25, 2));
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale - 0.25, 0.5));
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = file.file_url;
    link.download = file.file_name;
    link.click();
  };

  const zoomLevels = [
    { label: "50%", value: 0.5 },
    { label: "75%", value: 0.75 },
    { label: "100%", value: 1 },
    { label: "125%", value: 1.25 },
    { label: "150%", value: 1.5 },
    { label: "200%", value: 2 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="bg-surface border-b border-border p-4">
        <div className="flex items-center justify-between mb-3">
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

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              icon={<ChevronLeft size={16} />}
            />
            <span className="text-text font-mono text-sm">
              Página {pageNumber} de {numPages || "..."}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              icon={<ChevronRight size={16} />}
            />
            <input
              type="number"
              min="1"
              max={numPages || 1}
              value={pageNumber}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= numPages) {
                  setPageNumber(page);
                }
              }}
              className="w-16 px-2 py-1 bg-background border border-border rounded text-text text-center text-sm"
            />
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              icon={<ZoomOut size={16} />}
            />
            {zoomLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setScale(level.value)}
                className={`
                  px-2 py-1 rounded text-xs font-medium transition-colors
                  ${
                    scale === level.value
                      ? "bg-primary text-white"
                      : "bg-background text-textMuted hover:text-text"
                  }
                `}
              >
                {level.label}
              </button>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleZoomIn}
              disabled={scale >= 2}
              icon={<ZoomIn size={16} />}
            />
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-black/50 p-8 custom-scrollbar">
        <div className="flex justify-center">
          <Document
            file={file.file_url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            }
            error={
              <div className="text-red-400 text-center py-12">
                Erro ao carregar PDF. Verifique o arquivo.
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="shadow-2xl"
            />
          </Document>
        </div>
      </div>

      {/* Thumbnails Sidebar (simplified) */}
      {numPages && numPages > 1 && (
        <div className="absolute right-0 top-16 bottom-0 w-48 bg-surface/95 border-l border-border overflow-y-auto custom-scrollbar p-2">
          <div className="space-y-2">
            {[...Array(numPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setPageNumber(index + 1)}
                className={`
                  w-full p-2 rounded border-2 transition-colors
                  ${
                    pageNumber === index + 1
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-borderHover"
                  }
                `}
              >
                <div className="text-xs text-textMuted">Pág. {index + 1}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
