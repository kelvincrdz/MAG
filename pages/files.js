import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { isAuthenticated, getUserData } from "../mag-next/utils/auth";
import {
  getAllAudioFiles,
  getAllMarkdownFiles,
  getAllProcessedMags,
  deleteAudioFile,
  deleteMarkdownFile,
  searchFiles,
  getRelationships,
} from "../utils/database";
import MarkdownViewer from "../components/MarkdownViewer";

export default function FilesPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [audios, setAudios] = useState([]);
  const [markdowns, setMarkdowns] = useState([]);
  const [mags, setMags] = useState([]);
  const [filtro, setFiltro] = useState("todos"); // todos, audios, markdowns
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [selectedMd, setSelectedMd] = useState(null);
  const [relationships, setRelationships] = useState({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAuthenticated()) {
      router.replace("/");
    } else {
      const userData = getUserData();
      setUsuario(userData);
      carregarArquivos();
    }
  }, [router]);

  async function carregarArquivos() {
    setCarregando(true);
    try {
      const [audioData, mdData, magData] = await Promise.all([
        getAllAudioFiles(),
        getAllMarkdownFiles(),
        getAllProcessedMags(),
      ]);

      setAudios(
        audioData.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      );
      setMarkdowns(
        mdData.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      );
      setMags(
        magData.sort(
          (a, b) => new Date(b.dateProcessed) - new Date(a.dateProcessed)
        )
      );

      // Carrega relacionamentos
      const rels = {};
      for (const md of mdData) {
        const mdRels = await getRelationships(md.id);
        if (mdRels.length > 0) {
          rels[md.id] = mdRels;
        }
      }
      setRelationships(rels);
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error);
    } finally {
      setCarregando(false);
    }
  }

  async function handleDelete(id, type) {
    if (
      !confirm(
        `Deseja realmente excluir este ${
          type === "audio" ? "áudio" : "markdown"
        }?`
      )
    ) {
      return;
    }

    try {
      if (type === "audio") {
        await deleteAudioFile(id);
      } else {
        await deleteMarkdownFile(id);
      }
      await carregarArquivos();
    } catch (error) {
      console.error("Erro ao excluir arquivo:", error);
      alert("Erro ao excluir arquivo");
    }
  }

  async function handleSearch(term) {
    setBusca(term);
    if (!term.trim()) {
      carregarArquivos();
      return;
    }

    try {
      const results = await searchFiles(term);
      setAudios(results.audios);
      setMarkdowns(results.markdowns);
    } catch (error) {
      console.error("Erro ao buscar:", error);
    }
  }

  function formatFileSize(bytes) {
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

  const audiosFiltrados =
    filtro === "todos" || filtro === "audios" ? audios : [];
  const markdownsFiltrados =
    filtro === "todos" || filtro === "markdowns" ? markdowns : [];

  return (
    <div className="files-container">
      <Head>
        <title>MAG Player - Arquivos</title>
      </Head>

      <div className="files-header">
        <div className="header-top">
          <h1>📁 Arquivos</h1>
          <div className="header-actions">
            <button className="btn-back" onClick={() => router.push("/player")}>
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
                          onClick={() => {
                            // Redireciona para o player
                            router.push("/player");
                          }}
                          title="Tocar no player"
                        >
                          <i className="fas fa-play"></i>
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(audio.id, "audio")}
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
                          {md.content.substring(0, 100)}...
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
                          onClick={() => handleDelete(md.id, "markdown")}
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
                    onClick={() => router.push("/player")}
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
              // Redireciona para o player se for áudio
              router.push("/player");
            }
          }}
        />
      )}
    </div>
  );
}
