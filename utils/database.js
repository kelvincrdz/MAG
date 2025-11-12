// Camada de dados via Backend Python (FastAPI)
import { apiFetch, getApiBase } from './api';

// Normaliza campos do backend para o formato usado no front
function mapAudio(a) {
  const base = getApiBase();
  return {
    id: a.id,
    magId: a.mag_id ?? a.magId,
    fileName: a.file_name ?? a.fileName,
    blobUrl: a.file_url ? `${base}${a.file_url}` : a.blobUrl,
    size: a.size,
    type: a.mime_type ?? a.type,
    dateAdded: a.date_added ?? a.dateAdded
  };
}

function mapMarkdown(m) {
  return {
    id: m.id,
    magId: m.mag_id ?? m.magId,
    fileName: m.file_name ?? m.fileName,
    title: m.title,
    content: m.content,
    dateAdded: m.date_added ?? m.dateAdded
  };
}

export async function getAllAudioFiles() {
  const data = await apiFetch('/files/audio');
  return data.map(mapAudio);
}

export async function getAllMarkdownFiles() {
  const data = await apiFetch('/files/markdown');
  return data.map(mapMarkdown);
}

export async function getAllProcessedMags() {
  const data = await apiFetch('/mags');
  // já retorna nos campos esperados pelo front
  return data.map(m => ({
    id: m.id,
    fileName: m.file_name ?? m.fileName,
    dateProcessed: m.date_processed ?? m.dateProcessed,
    fileSize: m.file_size ?? m.fileSize,
    totalFiles: m.total_files ?? m.totalFiles
  }));
}

export async function getAudioFilesByMagId(magId) {
  const list = await getAllAudioFiles();
  return list.filter(a => a.magId === magId);
}

export async function getMarkdownFilesByMagId(magId) {
  const list = await getAllMarkdownFiles();
  return list.filter(m => m.magId === magId);
}

export async function getRelationships(fileId) {
  return await apiFetch(`/relationships/${fileId}`);
}

export async function getAudioFileById(id) {
  const a = await apiFetch(`/files/audio/${id}`);
  return mapAudio(a);
}

export async function getMarkdownFileById(id) {
  const m = await apiFetch(`/files/markdown/${id}`);
  return mapMarkdown(m);
}

export async function deleteAudioFile(id) {
  await apiFetch(`/files/audio/${id}`, { method: 'DELETE' });
}

export async function deleteMarkdownFile(id) {
  await apiFetch(`/files/markdown/${id}`, { method: 'DELETE' });
}

export async function searchFiles(searchTerm) {
  const q = encodeURIComponent(searchTerm || '');
  const data = await apiFetch(`/files/search?term=${q}`);
  return {
    audios: (data.audios || []).map(mapAudio),
    markdowns: (data.markdowns || []).map(mapMarkdown)
  };
}

export async function clearDatabase() {
  // Sem equivalente direto no backend; opcionalmente poderíamos expor uma rota admin.
  console.warn('clearDatabase() não é suportado no backend.');
}
