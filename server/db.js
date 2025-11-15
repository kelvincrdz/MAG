const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const dataDir = path.resolve(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, "app.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      codigo TEXT UNIQUE,
      nome TEXT,
      email TEXT,
      departamento TEXT,
      perfil TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS mags (
      id INTEGER PRIMARY KEY,
      file_name TEXT,
      file_size INTEGER,
      total_files INTEGER,
      date_processed TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audio_files (
      id INTEGER PRIMARY KEY,
      mag_id INTEGER,
      file_name TEXT,
      size INTEGER,
      mime_type TEXT,
      storage_path TEXT,
      file_url TEXT,
      date_added TEXT DEFAULT (datetime('now')),
      association_tag TEXT
    );

    CREATE TABLE IF NOT EXISTS markdown_files (
      id INTEGER PRIMARY KEY,
      mag_id INTEGER,
      file_name TEXT,
      title TEXT,
      content TEXT,
      date_added TEXT DEFAULT (datetime('now')),
      association_tag TEXT
    );

    CREATE TABLE IF NOT EXISTS relationships (
      id INTEGER PRIMARY KEY,
      source_id INTEGER,
      source_type TEXT,
      target_id INTEGER,
      target_type TEXT,
      date_created TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS mag_processing_history (
      id INTEGER PRIMARY KEY,
      mag_id INTEGER,
      file_name TEXT,
      audio_count INTEGER,
      markdown_count INTEGER,
      total_files INTEGER,
      origin TEXT DEFAULT 'local',
      saved_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

function seedUsers() {
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
  const get = db.prepare("SELECT id FROM users WHERE codigo = ?");
  const ins = db.prepare(
    "INSERT INTO users (codigo, nome, email, departamento, perfil) VALUES (?,?,?,?,?)"
  );
  for (const codigo of Object.keys(INITIAL_USERS)) {
    const exists = get.get(codigo);
    if (!exists) {
      const u = INITIAL_USERS[codigo];
      ins.run(codigo, u.nome, u.email, u.departamento, u.perfil);
    }
  }
}

module.exports = { db, init, seedUsers };
