// Detectar tipo de arquivo pela extensão
export const getFileType = (filename) => {
  const ext = filename.split(".").pop().toLowerCase();

  const typeMap = {
    md: "markdown",
    markdown: "markdown",
    mp3: "audio",
    wav: "audio",
    ogg: "audio",
    mp4: "video",
    webm: "video",
    mov: "video",
    jpg: "image",
    jpeg: "image",
    png: "image",
    gif: "image",
    webp: "image",
    pdf: "pdf",
  };

  return typeMap[ext] || "unknown";
};

// Formatar tamanho de arquivo
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// Upload de arquivo para Supabase Storage
export const uploadFile = async (supabase, file, bucket, path) => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) throw error;

    // Obter URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return { publicUrl, path: filePath };
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    throw error;
  }
};

// Deletar arquivo do Storage
export const deleteFile = async (supabase, bucket, path) => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Erro ao deletar arquivo:", error);
    throw error;
  }
};
