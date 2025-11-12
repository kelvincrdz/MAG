import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  getRelationships,
  getAudioFileById,
  getMarkdownFileById,
} from "../utils/database";

export default function MarkdownViewer({ markdown, onClose, onNavigate }) {
  const [relatedFiles, setRelatedFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (markdown) {
      loadRelatedFiles();
    }
  }, [markdown]);

  async function loadRelatedFiles() {
    setLoading(true);
    try {
      const rels = await getRelationships(markdown.id);
      const files = [];

      for (const rel of rels) {
        let file = null;
        if (rel.targetType === "audio") {
          file = await getAudioFileById(rel.targetId);
        } else if (rel.targetType === "markdown") {
          file = await getMarkdownFileById(rel.targetId);
        }

        if (file) {
          files.push({
            ...file,
            type: rel.targetType,
            relationId: rel.id,
          });
        }
      }

      setRelatedFiles(files);
    } catch (error) {
      console.error("Erro ao carregar arquivos relacionados:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleRelatedClick(file) {
    if (onNavigate) {
      onNavigate(file);
    }
  }

  function renderTag(tag) {
    if (!tag) return null;
    const label =
      tag === "depoimento"
        ? "Depoimento"
        : tag === "arquivos"
        ? "Arquivos"
        : "Outros";
    const cls =
      tag === "depoimento"
        ? "tag-depoimento"
        : tag === "arquivos"
        ? "tag-arquivos"
        : "tag-outros";
    return <span className={`badge badge-tag ${cls}`}>{label}</span>;
  }

  if (!markdown) return null;

  return (
    <div className="markdown-viewer-overlay" onClick={onClose}>
      <div className="markdown-viewer" onClick={(e) => e.stopPropagation()}>
        <button className="close-viewer" onClick={onClose}>
          ×
        </button>

        <div className="markdown-header">
          <h1>
            {markdown.title || markdown.fileName}{" "}
            {renderTag(markdown.associationTag)}
          </h1>
          <p className="markdown-meta">
            <i className="fas fa-calendar"></i>{" "}
            {new Date(markdown.dateAdded).toLocaleString("pt-BR")}
          </p>
        </div>

        <div className="markdown-body">
          <ReactMarkdown>{markdown.content}</ReactMarkdown>
        </div>

        {relatedFiles.length > 0 && (
          <div className="related-files-section">
            <h3>
              <i className="fas fa-link"></i> Arquivos Relacionados (
              {relatedFiles.length})
            </h3>
            <div className="related-files-list">
              {relatedFiles.map((file) => (
                <div
                  key={file.id}
                  className={`related-file-item ${file.type}`}
                  onClick={() => handleRelatedClick(file)}
                >
                  <div className="related-file-icon">
                    <i
                      className={`fas fa-${
                        file.type === "audio" ? "music" : "file-alt"
                      }`}
                    ></i>
                  </div>
                  <div className="related-file-info">
                    <h4>
                      {file.type === "audio"
                        ? file.fileName
                        : file.title || file.fileName}{" "}
                      {renderTag(file.associationTag)}
                    </h4>
                    <p>
                      {file.type === "audio"
                        ? "Arquivo de Áudio"
                        : "Documento Markdown"}
                    </p>
                  </div>
                  <div className="related-file-action">
                    <i className="fas fa-arrow-right"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-related">
            <i className="fas fa-spinner fa-spin"></i> Carregando
            relacionamentos...
          </div>
        )}
      </div>
    </div>
  );
}
