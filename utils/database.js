// Camada de dados com backend opcional; fallback para localStorage
import { getLastProcessedMag } from "./magProcessor";
import { apiFetch, getApiBase } from "./api";
const USE_BACKEND = !!getApiBase();

function mapAudio(a, base) {
  return {
    id: a.id,
    magId: a.mag_id ?? a.magId,
    fileName: a.file_name ?? a.fileName,
    blobUrl: a.file_url ? `${base}${a.file_url}` : a.blobUrl,
    size: a.size,
    type: a.mime_type ?? a.type,
    dateAdded: a.date_added ?? a.dateAdded,
    internalPath: a.internal_path ?? a.internalPath,
    role: a.role,
    associationTag: a.association_tag ?? a.associationTag,
  };
}
function mapMarkdown(m) {
  return {
    id: m.id,
    magId: m.mag_id ?? m.magId,
    fileName: m.file_name ?? m.fileName,
    title: m.title,
    content: m.content,
    dateAdded: m.date_added ?? m.dateAdded,
    internalPath: m.internal_path ?? m.internalPath,
    associationTag: m.association_tag ?? m.associationTag,
  };
}

export async function getAllAudioFiles() {
  if (USE_BACKEND) {
    const base = getApiBase();
    const data = await apiFetch("/files/audio");
    return data.map((a) => mapAudio(a, base));
  }
  const snap = getLocalFilesSnapshot();
  return snap ? snap.audios : [];
}

export async function getAllMarkdownFiles() {
  if (USE_BACKEND) {
    const data = await apiFetch("/files/markdown");
    return data.map(mapMarkdown);
  }
  const snap = getLocalFilesSnapshot();
  return snap ? snap.markdowns : [];
}

export async function getAllProcessedMags() {
  if (USE_BACKEND) {
    const data = await apiFetch("/mags");
    return data.map((m) => ({
      id: m.id,
      fileName: m.file_name ?? m.fileName,
      dateProcessed: m.date_processed ?? m.dateProcessed,
      fileSize: m.file_size ?? m.fileSize,
      totalFiles: m.total_files ?? m.totalFiles,
    }));
  }
  const snap = getLocalFilesSnapshot();
  return snap ? snap.mags : [];
}

export async function getAudioFilesByMagId(magId) {
  const list = await getAllAudioFiles();
  return list.filter((a) => a.magId === magId);
}

export async function getMarkdownFilesByMagId(magId) {
  const list = await getAllMarkdownFiles();
  return list.filter((m) => m.magId === magId);
}

export async function getRelationships(fileId) {
  if (USE_BACKEND) return await apiFetch(`/relationships/${fileId}`);
  return [];
}

export async function getAudioFileById(id) {
  if (USE_BACKEND) {
    const base = getApiBase();
    const a = await apiFetch(`/files/audio/${id}`);
    return mapAudio(a, base);
  }
  const list = await getAllAudioFiles();
  return list.find((a) => a.id === id) || null;
}

export async function getMarkdownFileById(id) {
  if (USE_BACKEND) {
    const m = await apiFetch(`/files/markdown/${id}`);
    return mapMarkdown(m);
  }
  const list = await getAllMarkdownFiles();
  return list.find((m) => m.id === id) || null;
}

export async function deleteAudioFile(id) {
  if (USE_BACKEND)
    return await apiFetch(`/files/audio/${id}`, { method: "DELETE" });
  alert("Exclusão de áudio não suportada no modo local.");
}

export async function deleteMarkdownFile(id) {
  if (USE_BACKEND)
    return await apiFetch(`/files/markdown/${id}`, { method: "DELETE" });
  alert("Exclusão de markdown não suportada no modo local.");
}

export async function searchFiles(searchTerm) {
  if (USE_BACKEND) {
    const q = encodeURIComponent(searchTerm || "");
    const data = await apiFetch(`/files/search?term=${q}`);
    const base = getApiBase();
    return {
      audios: (data.audios || []).map((a) => mapAudio(a, base)),
      markdowns: (data.markdowns || []).map(mapMarkdown),
    };
  }
  const lower = (searchTerm || "").toLowerCase();
  const audios = (await getAllAudioFiles()).filter((a) =>
    a.fileName.toLowerCase().includes(lower)
  );
  const markdowns = (await getAllMarkdownFiles()).filter((m) =>
    (m.title || m.fileName).toLowerCase().includes(lower)
  );
  return { audios, markdowns };
}

export function getLocalFilesSnapshot() {
  if (typeof window === "undefined") return null;
  const last = getLastProcessedMag();
  if (!last || !last.success) return null;
  const audios = (last.audioFiles || []).map((a, idx) => ({
    id: idx + 1,
    magId: last.magId,
    fileName: a.fileName,
    blobUrl: null,
    size: a.size,
    type: a.type,
    dateAdded: last.savedAt,
    internalPath: a.internalPath,
    role: a.role,
    associationTag: a.associationTag,
  }));
  const markdowns = (last.markdownFiles || []).map((m, idx) => ({
    id: idx + 1,
    magId: last.magId,
    fileName: m.fileName,
    title: m.title,
    content: "(conteúdo não persistido)",
    dateAdded: last.savedAt,
    internalPath: m.internalPath,
    associationTag: m.associationTag,
    references: m.references || [],
  }));
  const mags = [
    {
      id: last.magId || 0,
      fileName: "(local)",
      dateProcessed: last.savedAt,
      fileSize: undefined,
      totalFiles: last.totalFiles,
    },
  ];
  return { audios, markdowns, mags };
}

// --- Remote snapshot caching (para acesso posterior sem reprocessar .mag) ---
export function cacheRemoteSnapshot({
  audios = [],
  markdowns = [],
  mags = [],
}) {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      savedAt: new Date().toISOString(),
      audios: audios.map((a) => ({
        id: a.id,
        magId: a.magId,
        fileName: a.fileName,
        blobUrl: a.blobUrl, // URL do servidor
        size: a.size,
        type: a.type,
        dateAdded: a.dateAdded,
        internalPath: a.internalPath,
        role: a.role,
        associationTag: a.associationTag,
      })),
      markdowns: markdowns.map((m) => ({
        id: m.id,
        magId: m.magId,
        fileName: m.fileName,
        title: m.title,
        content: m.content?.substring(0, 5000) || "", // evita explodir localStorage
        dateAdded: m.dateAdded,
        internalPath: m.internalPath,
        associationTag: m.associationTag,
      })),
      mags: mags.map((g) => ({
        id: g.id,
        fileName: g.fileName,
        dateProcessed: g.dateProcessed,
        fileSize: g.fileSize,
        totalFiles: g.totalFiles,
      })),
    };
    localStorage.setItem("remoteSnapshot", JSON.stringify(payload));
  } catch (e) {
    console.warn("Falha ao salvar remoteSnapshot", e);
  }
}

export function getCachedRemoteSnapshot() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("remoteSnapshot");
    if (!raw) return null;
    const snap = JSON.parse(raw);
    if (!snap || !snap.audios) return null;
    return snap;
  } catch {
    return null;
  }
}
