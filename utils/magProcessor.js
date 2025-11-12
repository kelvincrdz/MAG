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
      const internal = fileName.replace("\\", "/");
      baseToInternal[fileName.split("/").slice(-1)[0]] = internal;
      allFileNames.push(internal);
    }

    // Prioriza Depoimento/Depoimento.mp3 como principal
    const depoimentoPath = "Depoimento/Depoimento.mp3";

    // Processa arquivos de áudio
    for (const internal of allFileNames.filter((n) => isAudioFile(n))) {
      const zipEntry = zip.files[internal];
      try {
        const blob = await zipEntry.async("blob");
        const url = URL.createObjectURL(blob);
        const role = internal === depoimentoPath ? "primary" : "attachment";
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
        const associationTag =
          internal.toLowerCase() === "arquivos/arquivos.md"
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
      .map((n) => n.replace("\\", "/"));
    // Validação mínima: arquivo não-vazio e contém pelo menos Markdown de Arquivos e/ou Depoimento
    const hasDepo = names.includes("Depoimento/Depoimento.mp3");
    const hasMd = names.includes("Arquivos/Arquivos.md");
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
      const internal = fileName.replace("\\", "/");
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
