import React, { useState } from "react";
import {
  X,
  Download,
  Code,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import Button from "../../common/Button";
import "highlight.js/styles/github-dark.css";

const MarkdownViewer = ({ file, onClose, onNavigate }) => {
  const [showSource, setShowSource] = useState(false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchContent();
  }, [file]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(file.file_url);
      const text = await response.text();
      setContent(text);
    } catch (error) {
      console.error("Erro ao carregar markdown:", error);
      setContent("*Erro ao carregar o arquivo*");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = file.file_url;
    link.download = file.file_name;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-surface border border-border rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b border-border gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1 min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-text truncate">
              {file.file_name}
            </h2>
            {file.description && (
              <span className="text-xs sm:text-sm text-textMuted line-clamp-1">
                {file.description}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
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
              onClick={() => setShowSource(!showSource)}
              icon={showSource ? <Eye size={20} /> : <Code size={20} />}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : showSource ? (
            <pre className="bg-background p-2 sm:p-4 rounded-lg border border-border overflow-x-auto text-xs sm:text-sm">
              <code>{content}</code>
            </pre>
          ) : (
            <div className="prose prose-invert prose-sm sm:prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkdownViewer;
