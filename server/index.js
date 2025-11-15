import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import AdmZip from "adm-zip";
import mime from "mime-types";
import * as db from "./jsondb.js";

const PORT = process.env.PORT || 8000;
const APP_NAME = process.env.APP_NAME || "MAG Node Server";

db.init();
db.seedUsers();

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const storageDir = path.resolve(process.cwd(), "storage");
const audioDir = path.join(storageDir, "audio");
const markdownDir = path.join(storageDir, "markdown");
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
if (!fs.existsSync(markdownDir)) fs.mkdirSync(markdownDir, { recursive: true });

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
  const row = db.getUserByCodigo(codigo);
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
  const mag = db.insertMag(file.originalname, file.size, entries.length);
  const magId = mag.id;

  const baseToInternal = {};
  for (const e of entries) {
    const internal = e.entryName.replace(/\\/g, "/");
    baseToInternal[path.basename(internal)] = internal;
  }

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
      const row = db.insertAudio(
        magId,
        base,
        buf.length,
        mimeType,
        rel,
        `/storage/${rel}`,
        tag
      );
      audios.push({
        ...row,
        internal_path: internal,
        role,
      });
    } else if (isMarkdown(internal)) {
      const text = e.getData().toString("utf8");
      const title = extractMarkdownTitle(text) || path.parse(base).name;
      const tag = internal.toLowerCase().startsWith("arquivos/")
        ? "arquivos"
        : "outros";
      // Persist markdown file to storage/markdown
      const safeName = `${magId}_${base}`.replace(/\s+/g, "_");
      const outPath = path.join(markdownDir, safeName);
      fs.writeFileSync(outPath, text, "utf8");
      const rel = path.relative(storageDir, outPath).split(path.sep).join("/");
      const fileUrl = `/storage/${rel}`;
      const row = db.insertMarkdown(
        magId,
        base,
        title,
        text,
        tag,
        rel,
        fileUrl
      );
      mds.push({
        ...row,
        internal_path: internal,
      });
    }
  }

  // relationships by references
  for (const m of mds) {
    const refs = detectReferences(m.content, [
      ...audios.map((a) => a.file_name),
      ...mds.map((mm) => mm.file_name),
    ]);
    for (const ref of refs) {
      const tgtA = audios.find((a) => a.file_name === ref);
      if (tgtA) {
        db.insertRelationship(m.id, "markdown", tgtA.id, "audio");
        continue;
      }
      const tgtM = mds.find((mm) => mm.file_name === ref && mm.id !== m.id);
      if (tgtM) {
        db.insertRelationship(m.id, "markdown", tgtM.id, "markdown");
      }
    }
  }

  // return payload
  audios.sort((x, y) => (y.role === "primary") - (x.role === "primary"));
  res.json({
    mag,
    audioFiles: audios,
    markdownFiles: mds,
  });
});

app.get("/files/audio", (req, res) => {
  const rows = db.getAllAudios();
  res.json(rows);
});
app.get("/files/markdown", (req, res) => {
  const rows = db.getAllMarkdowns();
  res.json(rows);
});
app.get("/files/audio/:id", (req, res) => {
  const row = db.getAudioById(req.params.id);
  if (!row) return res.status(404).json({ detail: "Áudio não encontrado" });
  res.json(row);
});
app.get("/files/markdown/:id", (req, res) => {
  const row = db.getMarkdownById(req.params.id);
  if (!row) return res.status(404).json({ detail: "Markdown não encontrado" });
  res.json(row);
});
app.delete("/files/audio/:id", (req, res) => {
  const row = db.getAudioById(req.params.id);
  if (!row) return res.status(404).json({ detail: "Áudio não encontrado" });
  const filePath = path.join(storageDir, row.storage_path);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  db.deleteAudio(req.params.id);
  res.json({ status: "ok" });
});
app.delete("/files/markdown/:id", (req, res) => {
  const row = db.getMarkdownById(req.params.id);
  if (!row) return res.status(404).json({ detail: "Markdown não encontrado" });
  db.deleteMarkdown(req.params.id);
  res.json({ status: "ok" });
});

app.get("/files/search", (req, res) => {
  const term = String(req.query.term || "").trim();
  if (!term) {
    return res.json({
      audios: db.getAllAudios(),
      markdowns: db.getAllMarkdowns(),
    });
  }
  const audios = db.searchAudiosByFileName(term);
  const markdowns = db.searchMarkdowns(term);
  res.json({ audios, markdowns });
});

app.get("/relationships/:source_id", (req, res) => {
  const rows = db.getRelationshipsForSource(req.params.source_id);
  res.json(rows);
});

app.get("/mags", (req, res) => {
  const rows = db.getAllMags();
  res.json(rows);
});

app.post("/mags/history", (req, res) => {
  const e = req.body || {};
  const row = db.insertMagHistory({
    mag_id: e.mag_id ?? null,
    file_name: e.file_name ?? null,
    audio_count: e.audio_count ?? 0,
    markdown_count: e.markdown_count ?? 0,
    total_files: e.total_files ?? 0,
    origin: e.origin ?? "local",
  });
  res.json(row);
});

app.get("/mags/history", (req, res) => {
  const limit = Math.max(
    1,
    Math.min(500, parseInt(req.query.limit || "100", 10))
  );
  const rows = db.getMagHistory(limit);
  res.json(rows);
});

app.listen(PORT, () => {
  console.log(`MAG Node Server listening on http://localhost:${PORT}`);
});
