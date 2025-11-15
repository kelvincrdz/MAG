import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple JSON-based storage for small-scale apps
// File layout:
// {
//   users: [{ id, codigo, nome, email, departamento, perfil, created_at, is_active }],
//   mags: [{ id, file_name, file_size, total_files, date_processed }],
//   audio_files: [{ id, mag_id, file_name, size, mime_type, storage_path, file_url, date_added, association_tag }],
//   markdown_files: [{ id, mag_id, file_name, title, content, date_added, association_tag }],
//   relationships: [{ id, source_id, source_type, target_id, target_type, date_created }],
//   mag_processing_history: [{ id, mag_id, file_name, audio_count, markdown_count, total_files, origin, saved_at }]
// }

const dataDir = path.resolve(__dirname, "data");
const dbFile = path.join(dataDir, "db.json");

function ensureDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function load() {
  ensureDir();
  if (!fs.existsSync(dbFile)) {
    const initial = {
      users: [],
      mags: [],
      audio_files: [],
      markdown_files: [],
      relationships: [],
      mag_processing_history: [],
    };
    fs.writeFileSync(dbFile, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const raw = fs.readFileSync(dbFile, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    // If corrupted, back it up and re-create
    const backup = dbFile + ".bak-" + Date.now();
    try {
      fs.copyFileSync(dbFile, backup);
    } catch {}
    const initial = {
      users: [],
      mags: [],
      audio_files: [],
      markdown_files: [],
      relationships: [],
      mag_processing_history: [],
    };
    fs.writeFileSync(dbFile, JSON.stringify(initial, null, 2));
    return initial;
  }
}

function save(state) {
  // Atomic-ish write for Windows: write temp then replace
  const tmp = dbFile + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, dbFile);
}

function nextId(list) {
  const max = list.reduce((m, x) => (x.id > m ? x.id : m), 0);
  return max + 1;
}

let state = load();

function nowISO() {
  return new Date().toISOString();
}

// Seed initial users if none
function seedUsers() {
  if (state.users && state.users.length > 0) return;
  const INITIAL_USERS = {
    "ORC/DDAE-11.25": {
      nome: "Magno Oliveira",
      email: "magno@ifce.edu.br",
      departamento: "DDAE",
      perfil: "Professor",
    },
    "ADM/COORD-01.25": {
      nome: "Maria Silva",
      email: "maria.silva@ifce.edu.br",
      departamento: "Coordenação",
      perfil: "Coordenador",
    },
    "TEC/LAB-05.25": {
      nome: "João Santos",
      email: "joao.santos@ifce.edu.br",
      departamento: "Laboratório",
      perfil: "Técnico",
    },
    "EST/INFO-10.25": {
      nome: "Ana Costa",
      email: "ana.costa@aluno.ifce.edu.br",
      departamento: "Informática",
      perfil: "Estudante",
    },
    "DOC/BIB-03.25": {
      nome: "Carlos Mendes",
      email: "carlos.mendes@ifce.edu.br",
      departamento: "Biblioteca",
      perfil: "Bibliotecário",
    },
  };
  const users = [];
  for (const codigo of Object.keys(INITIAL_USERS)) {
    const u = INITIAL_USERS[codigo];
    users.push({
      id: users.length + 1,
      codigo,
      nome: u.nome,
      email: u.email,
      departamento: u.departamento,
      perfil: u.perfil,
      created_at: nowISO(),
      is_active: 1,
    });
  }
  state.users = users;
  save(state);
}

function getUserByCodigo(codigo) {
  const code = String(codigo).toUpperCase().trim();
  return (
    state.users.find((u) => u.codigo === code && u.is_active === 1) || null
  );
}

function insertMag(file_name, file_size, total_files) {
  const id = nextId(state.mags);
  const mag = {
    id,
    file_name,
    file_size,
    total_files,
    date_processed: nowISO(),
  };
  state.mags.push(mag);
  save(state);
  return mag;
}

function insertAudio(
  mag_id,
  file_name,
  size,
  mime_type,
  storage_path,
  file_url,
  association_tag
) {
  const id = nextId(state.audio_files);
  const audio = {
    id,
    mag_id,
    file_name,
    size,
    mime_type,
    storage_path,
    file_url,
    date_added: nowISO(),
    association_tag,
  };
  state.audio_files.push(audio);
  save(state);
  return audio;
}

function insertMarkdown(
  mag_id,
  file_name,
  title,
  content,
  association_tag,
  storage_path = null,
  file_url = null
) {
  const id = nextId(state.markdown_files);
  const md = {
    id,
    mag_id,
    file_name,
    title,
    content,
    date_added: nowISO(),
    association_tag,
    storage_path,
    file_url,
  };
  state.markdown_files.push(md);
  save(state);
  return md;
}

function insertRelationship(source_id, source_type, target_id, target_type) {
  const id = nextId(state.relationships);
  const rel = {
    id,
    source_id,
    source_type,
    target_id,
    target_type,
    date_created: nowISO(),
  };
  state.relationships.push(rel);
  save(state);
  return rel;
}

function getAllAudios() {
  return [...state.audio_files].sort((a, b) => b.id - a.id);
}
function getAllMarkdowns() {
  return [...state.markdown_files].sort((a, b) => b.id - a.id);
}
function getAudioById(id) {
  return state.audio_files.find((a) => a.id === Number(id)) || null;
}
function getMarkdownById(id) {
  return state.markdown_files.find((m) => m.id === Number(id)) || null;
}
function deleteAudio(id) {
  const idx = state.audio_files.findIndex((a) => a.id === Number(id));
  if (idx === -1) return null;
  const [row] = state.audio_files.splice(idx, 1);
  save(state);
  return row;
}
function deleteMarkdown(id) {
  const idx = state.markdown_files.findIndex((m) => m.id === Number(id));
  if (idx === -1) return null;
  const [row] = state.markdown_files.splice(idx, 1);
  save(state);
  return row;
}

function searchAudiosByFileName(term) {
  const t = term.toLowerCase();
  return state.audio_files.filter((a) =>
    (a.file_name || "").toLowerCase().includes(t)
  );
}
function searchMarkdowns(term) {
  const t = term.toLowerCase();
  return state.markdown_files.filter(
    (m) =>
      (m.file_name || "").toLowerCase().includes(t) ||
      (m.title || "").toLowerCase().includes(t) ||
      (m.content || "").toLowerCase().includes(t)
  );
}

function getRelationshipsForSource(source_id) {
  return state.relationships.filter((r) => r.source_id === Number(source_id));
}

function getAllMags() {
  return [...state.mags].sort((a, b) =>
    a.date_processed < b.date_processed ? 1 : -1
  );
}

function insertMagHistory({
  mag_id = null,
  file_name = null,
  audio_count = 0,
  markdown_count = 0,
  total_files = 0,
  origin = "local",
}) {
  const id = nextId(state.mag_processing_history);
  const row = {
    id,
    mag_id,
    file_name,
    audio_count,
    markdown_count,
    total_files,
    origin,
    saved_at: nowISO(),
  };
  state.mag_processing_history.push(row);
  save(state);
  return row;
}

function getMagHistory(limit = 100) {
  const list = [...state.mag_processing_history].sort((a, b) =>
    a.saved_at < b.saved_at ? 1 : -1
  );
  return list.slice(0, Math.max(1, Math.min(500, Number(limit) || 100)));
}

export {
  // lifecycle
  seedUsers,
  // users
  getUserByCodigo,
  // mags
  insertMag,
  getAllMags,
  // audio
  insertAudio,
  getAllAudios,
  getAudioById,
  deleteAudio,
  // markdown
  insertMarkdown,
  getAllMarkdowns,
  getMarkdownById,
  deleteMarkdown,
  // search
  searchAudiosByFileName,
  searchMarkdowns,
  // relationships
  insertRelationship,
  getRelationshipsForSource,
  // history
  insertMagHistory,
  getMagHistory,
};

export const init = () => {};
