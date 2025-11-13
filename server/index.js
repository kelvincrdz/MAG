const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const AdmZip = require("adm-zip");
const mime = require("mime-types");
const { db, init, seedUsers } = require("./db");

const PORT = process.env.PORT || 8000;
const APP_NAME = process.env.APP_NAME || "MAG Node Server";

init();
seedUsers();

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const storageDir = path.resolve(process.cwd(), "storage");
const audioDir = path.join(storageDir, "audio");
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

app.use("/storage", express.static(storageDir));

const upload = multer({ storage: multer.memoryStorage() });

function isAudio(name) {
  const low = name.toLowerCase();
  return [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac", ".webm"].some(
    (ext) => low.endsWith(ext)
  );
}
function isMarkdown(name) {
  return name.toLowerCase().endsWith(".md");
}
function extractMarkdownTitle(content) {
  for (const line of content.split(/\r?\n/)) {
    const l = line.trim();
    if (l.startsWith("# ")) return l.slice(2).trim();
  }
  return "";
}
function detectReferences(content, available) {
  const refs = [];
  const low = content.toLowerCase();
  for (const fname of available) {
    const base = path.parse(fname).name.toLowerCase();
    if (low.includes(fname.toLowerCase()) || low.includes(base))
      refs.push(fname);
  }
  return refs;
}

app.get("/", (req, res) => {
  res.json({ status: "ok", name: APP_NAME });
});

app.post("/auth/login", (req, res) => {
  const { codigo } = req.body || {};
  if (!codigo) return res.status(400).json({ detail: "Código requerido" });
  const row = db
    .prepare("SELECT * FROM users WHERE codigo = ? AND is_active = 1")
    .get(String(codigo).toUpperCase().trim());
  if (!row) return res.status(400).json({ detail: "Código incorreto" });
  // Token simbólico (sem verificação) apenas como placeholder
  const token = Buffer.from(
    JSON.stringify({ codigo: row.codigo, t: Date.now() })
  ).toString("base64");
  res.json({ access_token: token, token_type: "bearer", user: row });
});

app.get("/users/me", (req, res) => {
  // Placeholder: em produção, validar token
  res.status(501).json({ detail: "Não implementado: autenticação opcional" });
});

app.post("/mags/process", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file || !file.originalname.toLowerCase().endsWith(".mag")) {
    return res.status(400).json({ detail: "Arquivo deve ser .mag" });
  }
  const zip = new AdmZip(file.buffer);
  const entries = zip.getEntries().filter((e) => !e.isDirectory);
  const allNames = entries.map((e) => e.entryName.replace(/\\/g, "/"));

  const magIns = db.prepare(
    "INSERT INTO mags (file_name, file_size, total_files) VALUES (?,?,?)"
  );
  const magId = magIns.run(
    file.originalname,
    file.size,
    entries.length
  ).lastInsertRowid;

  const baseToInternal = {};
  for (const e of entries) {
    const internal = e.entryName.replace(/\\/g, "/");
    baseToInternal[path.basename(internal)] = internal;
  }

  const audioIns = db.prepare(
    "INSERT INTO audio_files (mag_id, file_name, size, mime_type, storage_path, file_url, association_tag) VALUES (?,?,?,?,?,?,?)"
  );
  const mdIns = db.prepare(
    "INSERT INTO markdown_files (mag_id, file_name, title, content, association_tag) VALUES (?,?,?,?,?)"
  );

  const audios = [];
  const mds = [];

  // Identify depoimento path (any audio inside Depoimento/)
  const depoimentoBase = path.basename(
    allNames.find(
      (n) => n.toLowerCase().startsWith("depoimento/") && isAudio(n)
    ) || "Depoimento/Depoimento.mp3"
  );

  for (const e of entries) {
    const internal = e.entryName.replace(/\\/g, "/");
    const base = path.basename(internal);
    if (isAudio(internal)) {
      const buf = e.getData();
      const safeName = `${magId}_${base}`.replace(/\s+/g, "_");
      const outPath = path.join(audioDir, safeName);
      fs.writeFileSync(outPath, buf);
      const rel = path.relative(storageDir, outPath).split(path.sep).join("/");
      const role = base === depoimentoBase ? "primary" : "attachment";
      const tag =
        role === "primary"
          ? "depoimento"
          : internal.toLowerCase().startsWith("arquivos/")
          ? "arquivos"
          : "outros";
      const mimeType = mime.lookup(base) || "audio/mpeg";
      const rowId = audioIns.run(
        magId,
        base,
        buf.length,
        mimeType,
        rel,
        `/storage/${rel}`,
        tag
      ).lastInsertRowid;
      audios.push({
        id: rowId,
        mag_id: magId,
        file_name: base,
        size: buf.length,
        mime_type: mimeType,
        file_url: `/storage/${rel}`,
        internal_path: internal,
        role,
        association_tag: tag,
      });
    } else if (isMarkdown(internal)) {
      const text = e.getData().toString("utf8");
      const title = extractMarkdownTitle(text) || path.parse(base).name;
      const tag =
        internal.toLowerCase() === "arquivos/arquivos.md"
          ? "arquivos"
          : "outros";
      const rowId = mdIns.run(magId, base, title, text, tag).lastInsertRowid;
      mds.push({
        id: rowId,
        mag_id: magId,
        file_name: base,
        title,
        content: text,
        internal_path: internal,
        association_tag: tag,
      });
    }
  }

  // relationships by references
  const relIns = db.prepare(
    "INSERT INTO relationships (source_id, source_type, target_id, target_type) VALUES (?,?,?,?)"
  );
  for (const m of mds) {
    const refs = detectReferences(m.content, [
      ...audios.map((a) => a.file_name),
      ...mds.map((mm) => mm.file_name),
    ]);
    for (const ref of refs) {
      const tgtA = audios.find((a) => a.file_name === ref);
      if (tgtA) {
        relIns.run(m.id, "markdown", tgtA.id, "audio");
        continue;
      }
      const tgtM = mds.find((mm) => mm.file_name === ref && mm.id !== m.id);
      if (tgtM) {
        relIns.run(m.id, "markdown", tgtM.id, "markdown");
      }
    }
  }

  // return payload
  audios.sort((x, y) => (y.role === "primary") - (x.role === "primary"));
  res.json({
    mag: db.prepare("SELECT * FROM mags WHERE id = ?").get(magId),
    audioFiles: audios,
    markdownFiles: mds,
  });
});

app.get("/files/audio", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM audio_files ORDER BY date_added DESC")
    .all();
  res.json(rows);
});
app.get("/files/markdown", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM markdown_files ORDER BY date_added DESC")
    .all();
  res.json(rows);
});
app.get("/files/audio/:id", (req, res) => {
  const row = db
    .prepare("SELECT * FROM audio_files WHERE id = ?")
    .get(req.params.id);
  if (!row) return res.status(404).json({ detail: "Áudio não encontrado" });
  res.json(row);
});
app.get("/files/markdown/:id", (req, res) => {
  const row = db
    .prepare("SELECT * FROM markdown_files WHERE id = ?")
    .get(req.params.id);
  if (!row) return res.status(404).json({ detail: "Markdown não encontrado" });
  res.json(row);
});
app.delete("/files/audio/:id", (req, res) => {
  const row = db
    .prepare("SELECT * FROM audio_files WHERE id = ?")
    .get(req.params.id);
  if (!row) return res.status(404).json({ detail: "Áudio não encontrado" });
  const filePath = path.join(storageDir, row.storage_path);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  db.prepare("DELETE FROM audio_files WHERE id = ?").run(req.params.id);
  res.json({ status: "ok" });
});
app.delete("/files/markdown/:id", (req, res) => {
  const row = db
    .prepare("SELECT * FROM markdown_files WHERE id = ?")
    .get(req.params.id);
  if (!row) return res.status(404).json({ detail: "Markdown não encontrado" });
  db.prepare("DELETE FROM markdown_files WHERE id = ?").run(req.params.id);
  res.json({ status: "ok" });
});

app.get("/files/search", (req, res) => {
  const term = String(req.query.term || "").trim();
  if (!term) {
    return res.json({
      audios: db.prepare("SELECT * FROM audio_files").all(),
      markdowns: db.prepare("SELECT * FROM markdown_files").all(),
    });
  }
  const like = `%${term}%`;
  const audios = db
    .prepare("SELECT * FROM audio_files WHERE file_name LIKE ?")
    .all(like);
  const markdowns = db
    .prepare(
      "SELECT * FROM markdown_files WHERE file_name LIKE ? OR title LIKE ? OR content LIKE ?"
    )
    .all(like, like, like);
  res.json({ audios, markdowns });
});

app.get("/relationships/:source_id", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM relationships WHERE source_id = ?")
    .all(req.params.source_id);
  res.json(rows);
});

app.get("/mags", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM mags ORDER BY date_processed DESC")
    .all();
  res.json(rows);
});

app.post("/mags/history", (req, res) => {
  const e = req.body || {};
  const st = db.prepare(
    "INSERT INTO mag_processing_history (mag_id, file_name, audio_count, markdown_count, total_files, origin) VALUES (?,?,?,?,?,?)"
  );
  const id = st.run(
    e.mag_id || null,
    e.file_name || null,
    e.audio_count || 0,
    e.markdown_count || 0,
    e.total_files || 0,
    e.origin || "local"
  ).lastInsertRowid;
  res.json(
    db.prepare("SELECT * FROM mag_processing_history WHERE id = ?").get(id)
  );
});

app.get("/mags/history", (req, res) => {
  const limit = Math.max(
    1,
    Math.min(500, parseInt(req.query.limit || "100", 10))
  );
  const rows = db
    .prepare(
      "SELECT * FROM mag_processing_history ORDER BY saved_at DESC LIMIT ?"
    )
    .all(limit);
  res.json(rows);
});

app.listen(PORT, () => {
  console.log(`MAG Node Server listening on http://localhost:${PORT}`);
});
