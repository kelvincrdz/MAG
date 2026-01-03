import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export const useInvestigation = (characterId) => {
  const [cases, setCases] = useState([]);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [viewedFiles, setViewedFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);

      const [casesRes, foldersRes, filesRes, viewedRes] = await Promise.all([
        supabase.from("investigation_cases").select("*").order("order_index"),
        supabase.from("investigation_folders").select("*").order("order_index"),
        supabase.from("investigation_files").select("*").order("order_index"),
        characterId
          ? supabase
              .from("file_views")
              .select("file_id")
              .eq("character_id", characterId)
          : { data: [] },
      ]);

      if (casesRes.error) throw casesRes.error;
      if (foldersRes.error) throw foldersRes.error;
      if (filesRes.error) throw filesRes.error;

      setCases(casesRes.data);
      setFolders(foldersRes.data);
      setFiles(filesRes.data);
      setViewedFiles(viewedRes.data?.map((v) => v.file_id) || []);
    } catch (err) {
      console.error("Erro ao buscar investigação:", err);
    } finally {
      setLoading(false);
    }
  }, [characterId]);

  const createCase = async (name, description = "") => {
    const { data, error } = await supabase
      .from("investigation_cases")
      .insert({ name, description })
      .select()
      .single();

    if (error) throw error;
    setCases([...cases, data]);
    return data;
  };

  const deleteCase = async (caseId) => {
    try {
      console.log("Deletando caso:", caseId);
      const { error } = await supabase
        .from("investigation_cases")
        .delete()
        .eq("id", caseId);

      if (error) {
        console.error("Erro ao deletar caso:", error);
        throw error;
      }
      setCases(cases.filter((c) => c.id !== caseId));
      console.log("Caso deletado com sucesso");
    } catch (err) {
      console.error("Erro no deleteCase:", err);
      alert(`Erro ao excluir caso: ${err.message}`);
      throw err;
    }
  };

  const createFolder = async (caseId, name, parentFolderId = null) => {
    const { data, error } = await supabase
      .from("investigation_folders")
      .insert({ case_id: caseId, name, parent_folder_id: parentFolderId })
      .select()
      .single();

    if (error) throw error;
    setFolders([...folders, data]);
    return data;
  };

  const deleteFolder = async (folderId) => {
    try {
      console.log("Deletando pasta:", folderId);
      const { error } = await supabase
        .from("investigation_folders")
        .delete()
        .eq("id", folderId);

      if (error) {
        console.error("Erro ao deletar pasta:", error);
        throw error;
      }
      setFolders(folders.filter((f) => f.id !== folderId));
      console.log("Pasta deletada com sucesso");
    } catch (err) {
      console.error("Erro no deleteFolder:", err);
      alert(`Erro ao excluir pasta: ${err.message}`);
      throw err;
    }
  };

  const createFile = async (fileData) => {
    const { data, error } = await supabase
      .from("investigation_files")
      .insert(fileData)
      .select()
      .single();

    if (error) throw error;
    setFiles([...files, data]);
    return data;
  };

  const deleteFile = async (fileId) => {
    try {
      console.log("Deletando arquivo:", fileId);
      const { error } = await supabase
        .from("investigation_files")
        .delete()
        .eq("id", fileId);

      if (error) {
        console.error("Erro ao deletar arquivo:", error);
        throw error;
      }
      setFiles(files.filter((f) => f.id !== fileId));
      console.log("Arquivo deletado com sucesso");
    } catch (err) {
      console.error("Erro no deleteFile:", err);
      alert(`Erro ao excluir arquivo: ${err.message}`);
      throw err;
    }
  };

  const markFileAsViewed = async (fileId) => {
    if (!characterId || viewedFiles.includes(fileId)) return;

    const { error } = await supabase.from("file_views").upsert({
      file_id: fileId,
      character_id: characterId,
      viewed_at: new Date().toISOString(),
    });

    if (error) console.error("Erro ao marcar como visualizado:", error);
    else setViewedFiles([...viewedFiles, fileId]);
  };

  const updateFileSharing = async (fileId, sharedWith) => {
    const { data, error } = await supabase
      .from("investigation_files")
      .update({ shared_with: sharedWith })
      .eq("id", fileId)
      .select()
      .single();

    if (error) throw error;
    setFiles(files.map((f) => (f.id === fileId ? data : f)));
    return data;
  };

  const updateCaseSharing = async (caseId, sharedWith) => {
    const { data, error } = await supabase
      .from("investigation_cases")
      .update({ shared_with: sharedWith })
      .eq("id", caseId)
      .select()
      .single();

    if (error) throw error;
    setCases(cases.map((c) => (c.id === caseId ? data : c)));
    return data;
  };

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    cases,
    folders,
    files,
    viewedFiles,
    loading,
    createCase,
    deleteCase,
    createFolder,
    deleteFolder,
    createFile,
    deleteFile,
    markFileAsViewed,
    updateFileSharing,
    updateCaseSharing,
    refetch: fetchAll,
  };
};
