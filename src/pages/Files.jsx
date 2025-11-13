import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, getUserData } from "../utils/auth";
import MarkdownViewer from "../../components/MarkdownViewer.jsx";
import { getLocalFilesSnapshot } from "../../utils/database.js";

export default function Files() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [audios, setAudios] = useState([]);
  const [markdowns, setMarkdowns] = useState([]);
  const [mags, setMags] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [selectedMd, setSelectedMd] = useState(null);
  const [relationships, setRelationships] = useState({});
  const [usandoFallback, setUsandoFallback] = useState(true);

  useEffect(() => {
    document.title = "MAG Player - Arquivos";
    if (!isAuthenticated()) {
      navigate("/", { replace: true });
    } else {
      const userData = getUserData();
      setUsuario(userData);
      carregarArquivosLocais();
    }
  }, [navigate]);

  function carregarArquivosLocais() {
    setCarregando(true);
    const snap = getLocalFilesSnapshot();
    if (snap) {
      setUsandoFallback(true);
      const aud = snap.audios.sort(
        (a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)
      );
      const mds = snap.markdowns.sort(
        (a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)
      );
      const mgs = snap.mags.sort(
        (a, b) => new Date(b.dateProcessed) - new Date(a.dateProcessed)
      );
      setAudios(aud);
      setMarkdowns(mds);
      setMags(mgs);
      const rels = {};
      for (const md of mds) {
        const refs = md.references || [];
        if (refs.length > 0) {
          rels[md.id] = refs.map((ref) => ({
            source_id: md.id,
            source_type: "markdown",
            target_name: ref,
          }));
        }
      }
      setRelationships(rels);
    }
    setCarregando(false);
  }

  function formatFileSize(bytes) {
    if (!bytes && bytes !== 0) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleString("pt-BR");
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

  function handleSearch(term) {
    setBusca(term);
    if (!term.trim()) {
      carregarArquivosLocais();
      return;
    }
    const lower = term.toLowerCase();
    setAudios((prev) =>
      prev.filter((a) => a.fileName.toLowerCase().includes(lower))
    );
    setMarkdowns((prev) =>
      prev.filter((m) => (m.title || m.fileName).toLowerCase().includes(lower))
    );
  }

  async function handleDelete() {
    alert("Exclusão não está disponível no modo local (sem backend).");
  }

  const audiosFiltrados =
    filtro === "todos" || filtro === "audios" ? audios : [];
  const markdownsFiltrados =
    filtro === "todos" || filtro === "markdowns" ? markdowns : [];

  return (
    <div className="files-container">
      <div className="files-header">
        <div className="header-top">
          <h1>📁 Arquivos</h1>
          <div className="header-actions">
            <button className="btn-back" onClick={() => navigate("/player")}>
              <i className="fas fa-arrow-left"></i> Voltar ao Player
            </button>
          </div>
        </div>

        {usuario && (
          <div className="user-badge">
            <i className="fas fa-user"></i> {usuario.nome}
          </div>
        )}

        <div className="files-stats">
          <div className="stat-card">
            <div className="stat-number">{mags.length}</div>
            <div className="stat-label">.mag processados</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{audios.length}</div>
            <div className="stat-label">Áudios</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{markdowns.length}</div>
            <div className="stat-label">Markdowns</div>
          </div>
        </div>

        <div className="files-controls">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Buscar arquivos..."
              value={busca}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${filtro === "todos" ? "active" : ""}`}
              onClick={() => setFiltro("todos")}
            >
              Todos
            </button>
            <button
              className={`filter-btn ${filtro === "audios" ? "active" : ""}`}
              onClick={() => setFiltro("audios")}
            >
              <i className="fas fa-music"></i> Áudios
            </button>
            <button
              className={`filter-btn ${filtro === "markdowns" ? "active" : ""}`}
              onClick={() => setFiltro("markdowns")}
            >
              <i className="fas fa-file-alt"></i> Markdowns
            </button>
          </div>
        </div>
      </div>

      <div className="files-content">
        {carregando ? (
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Carregando arquivos...</p>
          </div>
        ) : (
          <>
            {usandoFallback && (
              <div className="warning-banner">
                <i className="fas fa-plug"></i> Exibindo dados locais do último
                processamento
              </div>
            )}
            {audiosFiltrados.length > 0 && (
              <div className="files-section">
                <h2>
                  <i className="fas fa-music"></i> Arquivos de Áudio (
                  {audiosFiltrados.length})
                </h2>
                <div className="files-grid">
                  {audiosFiltrados.map((audio) => (
                    <div key={audio.id} className="file-card audio-card">
                      <div className="file-icon">
                        <i className="fas fa-file-audio"></i>
                      </div>
                      <div className="file-info">
                        <h3>
                          {audio.fileName} {renderTag(audio.associationTag)}
                        </h3>
                        <p className="file-meta">
                          <span>{formatFileSize(audio.size)}</span>
                          <span>{formatDate(audio.dateAdded)}</span>
                        </p>
                      </div>
                      <div className="file-actions">
                        <button
                          className="btn-play"
                          onClick={() =>
                            navigate("/player", {
                              state: {
                                play: {
                                  internalPath: audio.internalPath,
                                  fileName: audio.fileName,
                                },
                                source: "files",
                              },
                            })
                          }
                          title="Tocar no player"
                        >
                          <i className="fas fa-play"></i>
                        </button>
                        <button
                          className="btn-delete"
                          onClick={handleDelete}
                          title="Excluir"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {markdownsFiltrados.length > 0 && (
              <div className="files-section">
                <h2>
                  <i className="fas fa-file-alt"></i> Arquivos Markdown (
                  {markdownsFiltrados.length})
                </h2>
                <div className="files-grid">
                  {markdownsFiltrados.map((md) => (
                    <div key={md.id} className="file-card markdown-card">
                      <div className="file-icon">
                        <i className="fas fa-file-alt"></i>
                      </div>
                      <div className="file-info">
                        <h3>
                          {md.title || md.fileName}{" "}
                          {renderTag(md.associationTag)}
                        </h3>
                        <p className="file-preview">
                          {(md.content || "").substring(0, 100)}...
                        </p>
                        <p className="file-meta">
                          <span>{formatDate(md.dateAdded)}</span>
                        </p>
                        {relationships[md.id] &&
                          relationships[md.id].length > 0 && (
                            <p className="file-links">
                              <i className="fas fa-link"></i>{" "}
                              {relationships[md.id].length} vínculo(s)
                            </p>
                          )}
                      </div>
                      <div className="file-actions">
                        <button
                          className="btn-view"
                          onClick={() => setSelectedMd(md)}
                          title="Visualizar"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn-delete"
                          onClick={handleDelete}
                          title="Excluir"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {audiosFiltrados.length === 0 &&
              markdownsFiltrados.length === 0 && (
                <div className="empty-state">
                  <i className="fas fa-folder-open"></i>
                  <h3>Nenhum arquivo encontrado</h3>
                  <p>Faça upload de um arquivo .mag no player para começar</p>
                  <button
                    className="btn-primary"
                    onClick={() => navigate("/player")}
                  >
                    Ir para o Player
                  </button>
                </div>
              )}
          </>
        )}
      </div>

      {selectedMd && (
        <MarkdownViewer
          markdown={selectedMd}
          onClose={() => setSelectedMd(null)}
          onNavigate={(file) => {
            if (file.type === "markdown") {
              setSelectedMd(file);
            } else {
              navigate("/player", {
                state: {
                  play: {
                    internalPath: file.internalPath,
                    fileName: file.fileName,
                  },
                  source: "markdown-viewer",
                },
              });
            }
          }}
        />
      )}
    </div>
  );
}
