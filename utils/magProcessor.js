// Processador de arquivos .mag (ZIP) para o MAG Player
// Extrai e processa conteúdo de arquivos ZIP

import {
  saveAudioFile,
  saveMarkdownFile,
  saveProcessedMag,
  createRelationship
} from './database';

/**
 * Verifica se é um arquivo de áudio suportado
 * @param {string} fileName - Nome do arquivo
 * @returns {boolean}
 */
function isAudioFile(fileName) {
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.webm'];
  return audioExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
}

/**
 * Verifica se é um arquivo Markdown
 * @param {string} fileName - Nome do arquivo
 * @returns {boolean}
 */
function isMarkdownFile(fileName) {
  return fileName.toLowerCase().endsWith('.md');
}

/**
 * Extrai título de um arquivo Markdown
 * @param {string} content - Conteúdo do markdown
 * @returns {string} Título extraído ou vazio
 */
function extractMarkdownTitle(content) {
  // Procura por # Título na primeira linha
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      return trimmed.substring(2).trim();
    }
  }
  return '';
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
  
  availableFiles.forEach(fileName => {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    if (lowerContent.includes(fileName.toLowerCase()) || 
        lowerContent.includes(nameWithoutExt.toLowerCase())) {
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
  const JSZip = (await import('jszip')).default;
  
  try {
    const zip = await JSZip.loadAsync(file);
    const files = Object.keys(zip.files);
    
    // Primeiro, salva o .mag processado
    const magId = await saveProcessedMag({
      fileName: file.name,
      fileSize: file.size,
      totalFiles: files.length
    });
    
    const audioFiles = [];
    const markdownFiles = [];
    const allFileNames = [];
    
    // Identifica todos os arquivos
    for (const fileName of files) {
      const zipEntry = zip.files[fileName];
      if (zipEntry.dir) continue; // Ignora diretórios
      
      allFileNames.push(fileName);
    }
    
    // Processa arquivos de áudio
    for (const fileName of files) {
      const zipEntry = zip.files[fileName];
      if (zipEntry.dir || !isAudioFile(fileName)) continue;
      
      try {
        const blob = await zipEntry.async('blob');
        const url = URL.createObjectURL(blob);
        
        const audioData = {
          magId,
          fileName,
          blobUrl: url,
          size: blob.size,
          type: blob.type || 'audio/mpeg'
        };
        
        const audioId = await saveAudioFile(audioData);
        audioFiles.push({ id: audioId, ...audioData });
      } catch (err) {
        console.error(`Erro ao processar áudio ${fileName}:`, err);
      }
    }
    
    // Processa arquivos Markdown
    for (const fileName of files) {
      const zipEntry = zip.files[fileName];
      if (zipEntry.dir || !isMarkdownFile(fileName)) continue;
      
      try {
        const content = await zipEntry.async('text');
        const title = extractMarkdownTitle(content) || fileName.replace('.md', '');
        const references = detectFileReferences(content, allFileNames);
        
        const markdownData = {
          magId,
          fileName,
          title,
          content,
          references
        };
        
        const mdId = await saveMarkdownFile(markdownData);
        markdownFiles.push({ id: mdId, ...markdownData });
      } catch (err) {
        console.error(`Erro ao processar markdown ${fileName}:`, err);
      }
    }
    
    // Cria relacionamentos baseados em referências
    for (const md of markdownFiles) {
      if (!md.references || md.references.length === 0) continue;
      
      for (const refFileName of md.references) {
        // Procura áudio correspondente
        const audio = audioFiles.find(a => a.fileName === refFileName);
        if (audio) {
          await createRelationship(md.id, 'markdown', audio.id, 'audio');
        }
        
        // Procura outro markdown correspondente
        const otherMd = markdownFiles.find(m => m.id !== md.id && m.fileName === refFileName);
        if (otherMd) {
          await createRelationship(md.id, 'markdown', otherMd.id, 'markdown');
        }
      }
    }
    
    return {
      success: true,
      magId,
      audioFiles,
      markdownFiles,
      totalFiles: audioFiles.length + markdownFiles.length
    };
  } catch (error) {
    console.error('Erro ao processar arquivo .mag:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Valida se um arquivo é um .mag válido
 * @param {File} file - Arquivo para validar
 * @returns {Promise<boolean>}
 */
export async function validateMagFile(file) {
  if (!file.name.toLowerCase().endsWith('.mag')) {
    return false;
  }
  
  try {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(file);
    return Object.keys(zip.files).length > 0;
  } catch (error) {
    console.error('Erro ao validar arquivo .mag:', error);
    return false;
  }
}

/**
 * Obtém informações básicas de um arquivo .mag sem processá-lo completamente
 * @param {File} file - Arquivo .mag
 * @returns {Promise<Object>} Informações do arquivo
 */
export async function getMagFileInfo(file) {
  const JSZip = (await import('jszip')).default;
  
  try {
    const zip = await JSZip.loadAsync(file);
    const files = Object.keys(zip.files);
    
    let audioCount = 0;
    let markdownCount = 0;
    let otherCount = 0;
    
    files.forEach(fileName => {
      if (zip.files[fileName].dir) return;
      
      if (isAudioFile(fileName)) {
        audioCount++;
      } else if (isMarkdownFile(fileName)) {
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
      otherCount
    };
  } catch (error) {
    console.error('Erro ao obter informações do arquivo .mag:', error);
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
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  
  for (const file of files) {
    zip.file(file.name, file);
  }
  
  return await zip.generateAsync({ type: 'blob' });
}
