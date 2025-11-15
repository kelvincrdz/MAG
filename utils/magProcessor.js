// Processador de arquivos .mag (ZIP) para o MAG Player
// Extrai e processa conteúdo de arquivos ZIP

// Processamento local (fallback) sem persistência no backend

/**
 * Verifica se é um arquivo de áudio suportado
 * @param {string} fileName - Nome do arquivo
 * @returns {boolean}
 */
function isAudioFile(fileName) {
  const audioExtensions = [
    ".mp3",
    ".wav",
    ".ogg",
    ".m4a",
    ".aac",
    ".flac",
    ".webm",
  ];
  return audioExtensions.some((ext) => fileName.toLowerCase().endsWith(ext));
}

/**
 * Verifica se é um arquivo Markdown
 * @param {string} fileName - Nome do arquivo
 * @returns {boolean}
 */
function isMarkdownFile(fileName) {
  return fileName.toLowerCase().endsWith(".md");
}

/**
 * Extrai título de um arquivo Markdown
 * @param {string} content - Conteúdo do markdown
 * @returns {string} Título extraído ou vazio
 */
function extractMarkdownTitle(content) {
  // Procura por # Título na primeira linha
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      return trimmed.substring(2).trim();
    }
  }
  return "";
}

/**
 * Detecta referências a outros arquivos no conteúdo
 * @param {string} content - Conteúdo para analisar
 * @param {Array} availableFiles - Lista de arquivos disponíveis
 * @returns {Array} Lista de nomes de arquivos referenciados
 */
function detectFileReferences(content, availableFiles) {
  const references = [];
  const lowerContent = content.toLowerCase();

  availableFiles.forEach((fileName) => {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    if (
      lowerContent.includes(fileName.toLowerCase()) ||
      lowerContent.includes(nameWithoutExt.toLowerCase())
    ) {
      references.push(fileName);
    }
  });

  return references;
}

/**
 * Processa um arquivo .mag (ZIP)
 * @param {File} file - Arquivo .mag
 * @returns {Promise<Object>} Resultado do processamento
 */
export async function processMagFile(file) {
  // Importa JSZip dinamicamente
  const JSZip = (await import("jszip")).default;

  try {
    const zip = await JSZip.loadAsync(file);
    const files = Object.keys(zip.files);

    const audioFiles = [];
    const markdownFiles = [];
    const allFileNames = [];
    const baseToInternal = {};

    // Identifica todos os arquivos (com caminho interno)
    for (const fileName of files) {
      const zipEntry = zip.files[fileName];
      if (zipEntry.dir) continue; // Ignora diretórios
      const internal = fileName.replace(/\\/g, "/");
      baseToInternal[fileName.split("/").slice(-1)[0]] = internal;
      allFileNames.push(internal);
    }

    // Detecta um áudio dentro de Depoimento/ como principal (qualquer nome)
    const depoimentoPath =
      allFileNames.find(
        (n) => n.toLowerCase().startsWith("depoimento/") && isAudioFile(n)
      ) || null;

    // Processa arquivos de áudio
    for (const internal of allFileNames.filter((n) => isAudioFile(n))) {
      const zipEntry = zip.files[internal];
      try {
        const blob = await zipEntry.async("blob");
        const url = URL.createObjectURL(blob);
        const role =
          depoimentoPath && internal === depoimentoPath
            ? "primary"
            : "attachment";
        const associationTag =
          role === "primary"
            ? "depoimento"
            : internal.toLowerCase().startsWith("arquivos/")
            ? "arquivos"
            : "outros";
        const audioData = {
          fileName: internal.split("/").slice(-1)[0],
          internalPath: internal,
          blobUrl: url,
          size: blob.size,
          type: blob.type || "audio/mpeg",
          role,
          associationTag,
        };
        audioFiles.push(audioData);
      } catch (err) {
        console.error(`Erro ao processar áudio ${internal}:`, err);
      }
    }

    // Processa arquivos Markdown
    for (const internal of allFileNames.filter((n) => isMarkdownFile(n))) {
      const zipEntry = zip.files[internal];
      try {
        const content = await zipEntry.async("text");
        const title =
          extractMarkdownTitle(content) ||
          internal.split("/").slice(-1)[0].replace(".md", "");
        const references = detectFileReferences(
          content,
          allFileNames.map((p) => p.split("/").slice(-1)[0])
        );
        const associationTag = internal.toLowerCase().startsWith("arquivos/")
          ? "arquivos"
          : "outros";
        const markdownData = {
          fileName: internal.split("/").slice(-1)[0],
          internalPath: internal,
          title,
          content,
          references,
          associationTag,
        };
        markdownFiles.push(markdownData);
      } catch (err) {
        console.error(`Erro ao processar markdown ${internal}:`, err);
      }
    }

    // Ordena áudios para que o principal venha primeiro
    audioFiles.sort((a, b) => (b.role === "primary") - (a.role === "primary"));

    return {
      success: true,
      magId: undefined,
      audioFiles,
      markdownFiles,
      totalFiles: audioFiles.length + markdownFiles.length,
    };
  } catch (error) {
    console.error("Erro ao processar arquivo .mag:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Valida se um arquivo é um .mag válido
 * @param {File} file - Arquivo para validar
 * @returns {Promise<boolean>}
 */
export async function validateMagFile(file) {
  if (!file.name.toLowerCase().endsWith(".mag")) {
    return false;
  }

  try {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(file);
    const names = Object.keys(zip.files)
      .filter((n) => !zip.files[n].dir)
      .map((n) => n.replace(/\\/g, "/"));
    // Validação mínima: arquivo não-vazio e contém pelo menos um áudio em Depoimento/ ou um markdown em Arquivos/
    const hasDepo = names.some(
      (n) => n.toLowerCase().startsWith("depoimento/") && isAudioFile(n)
    );
    const hasMd = names.some(
      (n) => n.toLowerCase().startsWith("arquivos/") && isMarkdownFile(n)
    );
    return names.length > 0 && (hasDepo || hasMd);
  } catch (error) {
    console.error("Erro ao validar arquivo .mag:", error);
    return false;
  }
}

/**
 * Obtém informações básicas de um arquivo .mag sem processá-lo completamente
 * @param {File} file - Arquivo .mag
 * @returns {Promise<Object>} Informações do arquivo
 */
export async function getMagFileInfo(file) {
  const JSZip = (await import("jszip")).default;

  try {
    const zip = await JSZip.loadAsync(file);
    const files = Object.keys(zip.files);

    let audioCount = 0;
    let markdownCount = 0;
    let otherCount = 0;

    files.forEach((fileName) => {
      if (zip.files[fileName].dir) return;
      const internal = fileName.replace(/\\/g, "/");
      if (isAudioFile(internal)) {
        audioCount++;
      } else if (isMarkdownFile(internal)) {
        markdownCount++;
      } else {
        otherCount++;
      }
    });

    return {
      fileName: file.name,
      fileSize: file.size,
      totalFiles: files.length,
      audioCount,
      markdownCount,
      otherCount,
    };
  } catch (error) {
    console.error("Erro ao obter informações do arquivo .mag:", error);
    return null;
  }
}

/**
 * Cria um arquivo .mag (ZIP) a partir de arquivos
 * @param {Array<File>} files - Arquivos para incluir no .mag
 * @param {string} magName - Nome do arquivo .mag
 * @returns {Promise<Blob>} Blob do arquivo .mag criado
 */
export async function createMagFile(files, magName) {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.name, file);
  }

  return await zip.generateAsync({ type: "blob" });
}

/**
 * Salva o resultado de um processamento .mag localmente (ex.: localStorage)
 * Usado por código legado que chama saveProcessedMag após processMagFile.
 * Evita erro "is not a function" quando a função não existia.
 * Atenção: grandes blobs podem exceder limite do localStorage.
 * @param {Object} processedData Objeto retornado por processMagFile ou enriquecido pelo backend
 * @returns {boolean} true se salvou, false caso contrário
 */
export function saveProcessedMag(processedData) {
  try {
    if (typeof window === "undefined") return false;
    const MAX_ITEMS = 25; // limite de históricos
    const MAX_BYTES = 200_000; // ~200KB de JSON para prevenir estouro
    // Sanitiza removendo URLs de blob (não faz sentido persistir)
    const safe = {
      savedAt: new Date().toISOString(),
      audioFiles: (processedData?.audioFiles || []).map((a) => ({
        fileName: a.fileName,
        internalPath: a.internalPath,
        size: a.size,
        type: a.type,
        role: a.role,
        associationTag: a.associationTag,
      })),
      markdownFiles: (processedData?.markdownFiles || []).map((m) => ({
        fileName: m.fileName,
        internalPath: m.internalPath,
        title: m.title,
        references: m.references,
        associationTag: m.associationTag,
      })),
      totalFiles: processedData?.totalFiles,
      magId: processedData?.magId,
      success: processedData?.success === true,
    };
    localStorage.setItem("lastMagProcessed", JSON.stringify(safe));

    // Histórico acumulado
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem("magProcessedHistory") || "[]");
      if (!Array.isArray(history)) history = [];
    } catch {
      history = [];
    }
    history.unshift(safe); // mais recente primeiro
    // Trimming por quantidade
    if (history.length > MAX_ITEMS) history = history.slice(0, MAX_ITEMS);
    // Trimming por tamanho total
    let jsonStr = JSON.stringify(history);
    while (jsonStr.length > MAX_BYTES && history.length > 1) {
      history.pop();
      jsonStr = JSON.stringify(history);
    }
    localStorage.setItem("magProcessedHistory", jsonStr);
    return true;
  } catch (e) {
    console.error("Falha ao salvar processed .mag:", e);
    return false;
  }
}

/**
 * Recupera último processamento salvo por saveProcessedMag
 * @returns {Object|null}
 */
export function getLastProcessedMag() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("lastMagProcessed");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Não foi possível ler lastMagProcessed:", e);
    return null;
  }
}

/**
 * Recupera lista de históricos (mais recente primeiro)
 */
export function getProcessedMagHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("magProcessedHistory");
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
