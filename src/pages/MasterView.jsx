import React, { useState } from "react";
import { Plus, Upload, Users, Sword, BookOpen, Dices } from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import AttributeList from "../components/characters/AttributeList";
import ResourceBarList from "../components/characters/ResourceBarList";
import NotesEditor from "../components/characters/NotesEditor";
import InitiativeCarousel from "../components/initiative/InitiativeCarousel";
import InvestigationTree from "../components/investigation/InvestigationTree";
import ShareModal from "../components/investigation/ShareModal";
import FileDropzone from "../components/investigation/FileDropzone";
import DiceRoller from "../components/dice/DiceRoller";
import MarkdownViewer from "../components/investigation/viewers/MarkdownViewer";
import AudioPlayer from "../components/investigation/viewers/AudioPlayer";
import VideoPlayer from "../components/investigation/viewers/VideoPlayer";
import ImageViewer from "../components/investigation/viewers/ImageViewer";
import PDFViewer from "../components/investigation/viewers/PDFViewer";
import Modal from "../components/common/Modal";
import Input from "../components/common/Input";
import { useCharacter, useCharacters } from "../hooks/useCharacter";
import { useGameSession } from "../hooks/useGameSession";
import { useInvestigation } from "../hooks/useInvestigation";
import { useRealtime, useDiceRolls } from "../hooks/useRealtime";
import { uploadFile, getFileType } from "../lib/fileHandlers";
import { supabase } from "../lib/supabase";

const MasterDashboard = ({ character }) => {
  const [activeTab, setActiveTab] = useState("iniciativa");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newCaseName, setNewCaseName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [showNewCharModal, setShowNewCharModal] = useState(false);
  const [newCharName, setNewCharName] = useState("");
  const [newCharType, setNewCharType] = useState("player");
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showShareCaseModal, setShowShareCaseModal] = useState(false);
  const [showShareFileModal, setShowShareFileModal] = useState(false);
  const [selectedCaseForShare, setSelectedCaseForShare] = useState(null);
  const [selectedFileForShare, setSelectedFileForShare] = useState(null);

  const {
    character: currentChar,
    updateAttributes,
    updateResourceBars,
    updateNotes,
  } = useCharacter(character.id);
  const { characters, refetch: refetchChars } = useCharacters();
  const {
    session,
    nextTurn,
    previousTurn,
    resetTurn,
    skipTurn,
    reorderInitiative,
    toggleCombatMode,
  } = useGameSession();
  const {
    cases,
    folders,
    files,
    createCase,
    deleteCase,
    createFolder,
    deleteFolder,
    createFile,
    deleteFile,
    updateFileSharing,
    refetch: refetchInvestigation,
  } = useInvestigation(character.id);
  const { rolls, addRoll } = useDiceRolls();

  const handleShareCase = async (caseItem) => {
    setSelectedCaseForShare(caseItem);
    setShowShareCaseModal(true);
  };

  const handleShareFile = async (file) => {
    setSelectedFileForShare(file);
    setShowShareFileModal(true);
  };

  const handleUpdateCaseSharing = async (sharedWith) => {
    try {
      await supabase
        .from("investigation_cases")
        .update({ shared_with: sharedWith })
        .eq("id", selectedCaseForShare.id);
      await refetchInvestigation();
      setShowShareCaseModal(false);
    } catch (error) {
      console.error("Erro ao atualizar compartilhamento:", error);
      alert("Erro ao atualizar compartilhamento");
    }
  };

  const handleUpdateFileSharing = async (sharedWith) => {
    try {
      await updateFileSharing(selectedFileForShare.id, sharedWith);
      setShowShareFileModal(false);
    } catch (error) {
      console.error("Erro ao atualizar compartilhamento:", error);
      alert("Erro ao atualizar compartilhamento");
    }
  };

  // Setup realtime
  useRealtime({
    onCharacterUpdate: () => refetchChars(),
    onSessionUpdate: () => {},
    onNewFile: () => {},
    onNewRoll: () => {},
  });

  const initiativeCharacters = session?.initiative_order
    ? session.initiative_order
        .map((id) => characters.find((c) => c.id === id))
        .filter(Boolean)
    : characters;

  const handleFileUpload = async (filesOrEvent) => {
    // Aceita tanto um evento quanto um array de arquivos
    const uploadedFiles = Array.isArray(filesOrEvent)
      ? filesOrEvent
      : Array.from(filesOrEvent.target.files);

    if (!uploadedFiles.length || !selectedFolder) return;

    try {
      setUploading(true);
      setUploadError("");
      setUploadProgress([]);

      const progressArray = uploadedFiles.map((file) => ({
        name: file.name,
        status: "pending",
        progress: 0,
      }));
      setUploadProgress(progressArray);

      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];

        try {
          // Atualizar status para uploading
          setUploadProgress((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, status: "uploading", progress: 50 } : item
            )
          );

          const fileType = getFileType(file.name);
          const fileExt = file.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random()
            .toString(36)
            .substring(7)}.${fileExt}`;
          const filePath = `investigation/${selectedFolder.id}/${fileName}`;

          // Upload para mag-files bucket
          const { error: uploadError } = await supabase.storage
            .from("mag-files")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) throw uploadError;

          // Obter URL pública
          const { data: urlData } = supabase.storage
            .from("mag-files")
            .getPublicUrl(filePath);

          // Criar registro no banco
          await createFile({
            folder_id: selectedFolder.id,
            file_name: file.name,
            file_type: fileType,
            file_url: urlData.publicUrl,
            shared_with: ["all"],
            uploaded_by: character.id,
          });

          // Atualizar status para complete
          setUploadProgress((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, status: "complete", progress: 100 } : item
            )
          );
        } catch (err) {
          console.error(`Erro ao fazer upload de ${file.name}:`, err);
          setUploadProgress((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, status: "error", progress: 0 } : item
            )
          );
        }
      }

      // Aguardar um pouco antes de fechar
      setTimeout(() => {
        setShowUploadModal(false);
        setSelectedFolder(null);
        setUploadProgress([]);
      }, 1500);
    } catch (error) {
      console.error("Erro no upload:", error);
      setUploadError(error.message || "Erro ao fazer upload dos arquivos");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateCase = async () => {
    if (!newCaseName.trim()) return;
    try {
      await createCase(newCaseName);
      setNewCaseName("");
      setShowNewCaseModal(false);
    } catch (error) {
      alert("Erro ao criar caso");
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !selectedCase) return;
    try {
      await createFolder(selectedCase.id, newFolderName);
      setNewFolderName("");
      setShowNewFolderModal(false);
      setSelectedCase(null);
    } catch (error) {
      alert("Erro ao criar pasta");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateCharacter = async () => {
    if (!newCharName.trim()) return;
    try {
      setUploadingAvatar(true);

      let avatarUrl = null;

      // Upload avatar se houver
      if (avatarFile) {
        const fileName = `avatar-${Date.now()}-${avatarFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("mag-files")
          .upload(`avatars/${fileName}`, avatarFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("mag-files")
          .getPublicUrl(`avatars/${fileName}`);

        avatarUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("characters").insert({
        name: newCharName.trim(),
        is_master: false,
        character_type: newCharType,
        attributes: [],
        resource_bars: [],
        notes: "",
        avatar_url: avatarUrl,
      });

      if (error) throw error;

      setNewCharName("");
      setNewCharType("player");
      setAvatarFile(null);
      setAvatarPreview(null);
      setShowNewCharModal(false);
      refetchChars();
    } catch (error) {
      console.error("Erro ao criar personagem:", error);
      alert("Erro ao criar personagem");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteCharacter = async (charId) => {
    if (!confirm("Tem certeza que deseja excluir este personagem?")) return;

    try {
      // Primeiro, verificar se pode excluir (não é o mestre atual)
      if (charId === character.id) {
        alert("Você não pode excluir o personagem mestre atual!");
        return;
      }

      // Buscar dados relacionados antes de excluir
      const charToDelete = characters.find((c) => c.id === charId);
      console.log("Excluindo personagem:", charToDelete?.name, charId);

      // 1. Remover da ordem de iniciativa se estiver presente
      if (session?.initiative_order?.includes(charId)) {
        console.log("Removendo da ordem de iniciativa...");
        const newOrder = session.initiative_order.filter((id) => id !== charId);
        const { error: sessionError } = await supabase
          .from("game_session")
          .update({
            initiative_order: newOrder,
            current_turn_index: Math.min(
              session.current_turn_index,
              Math.max(0, newOrder.length - 1)
            ),
          })
          .eq("id", session.id);

        if (sessionError) {
          console.error("Erro ao atualizar sessão:", sessionError);
        }
      }

      // 2. Excluir visualizações de arquivos do personagem
      console.log("Excluindo visualizações de arquivos...");
      const { error: viewsError } = await supabase
        .from("file_views")
        .delete()
        .eq("character_id", charId);

      if (viewsError) {
        console.error("Erro ao excluir visualizações:", viewsError);
      }

      // 3. Excluir rolagens de dados do personagem
      console.log("Excluindo rolagens de dados...");
      const { error: rollsError, count: rollsCount } = await supabase
        .from("dice_rolls")
        .delete({ count: "exact" })
        .eq("character_id", charId);

      if (rollsError) {
        console.error("Erro ao excluir rolagens:", rollsError);
        throw new Error(
          `Não foi possível excluir rolagens de dados: ${rollsError.message}`
        );
      }
      console.log(`${rollsCount || 0} rolagens excluídas`);

      // 4. Atualizar arquivos onde o personagem é uploader
      console.log("Atualizando arquivos de investigação...");
      const { error: filesError, count: filesCount } = await supabase
        .from("investigation_files")
        .update({ uploaded_by: null }, { count: "exact" })
        .eq("uploaded_by", charId);

      if (filesError) {
        console.error("Erro ao atualizar arquivos:", filesError);
      }
      console.log(`${filesCount || 0} arquivos atualizados`);

      // 5. Verificar se há outros registros relacionados
      console.log("Verificando tabelas relacionadas...");

      // Verificar file_views restantes
      const { data: remainingViews, error: viewsCheckError } = await supabase
        .from("file_views")
        .select("id")
        .eq("character_id", charId);

      if (viewsCheckError) {
        console.error("Erro ao verificar file_views:", viewsCheckError);
      }

      if (remainingViews && remainingViews.length > 0) {
        console.error(
          `ERRO: Ainda há ${remainingViews.length} visualizações de arquivo`
        );
        throw new Error(
          `Não foi possível excluir todas as visualizações de arquivo (${remainingViews.length} restantes)`
        );
      }

      // Verificar dice_rolls restantes
      const { data: remainingRolls, error: rollsCheckError } = await supabase
        .from("dice_rolls")
        .select("id, expression, created_at")
        .eq("character_id", charId);

      if (rollsCheckError) {
        console.error("Erro ao verificar dice_rolls:", rollsCheckError);
      }

      if (remainingRolls && remainingRolls.length > 0) {
        console.error(
          `ERRO: Ainda há ${remainingRolls.length} rolagens de dados:`,
          remainingRolls
        );
        throw new Error(
          `Não foi possível excluir todas as rolagens de dados (${remainingRolls.length} restantes). Verifique as permissões RLS.`
        );
      }

      // Verificar investigation_files relacionados
      const { data: relatedFiles, error: filesCheckError } = await supabase
        .from("investigation_files")
        .select("id")
        .eq("uploaded_by", charId);

      if (filesCheckError) {
        console.error(
          "Erro ao verificar investigation_files:",
          filesCheckError
        );
      }

      if (relatedFiles && relatedFiles.length > 0) {
        console.error(
          `ERRO: Ainda há ${relatedFiles.length} arquivos com referência ao personagem`
        );
        throw new Error(
          `Não foi possível atualizar todos os arquivos (${relatedFiles.length} restantes)`
        );
      }

      // 6. Finalmente, excluir o personagem
      console.log("Excluindo personagem do banco...");
      const { error, data } = await supabase
        .from("characters")
        .delete()
        .eq("id", charId)
        .select();

      if (error) {
        console.error("Erro detalhado do Supabase:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw new Error(
          `Erro ${error.code}: ${error.message}\n${error.details || ""}\n${
            error.hint || ""
          }`
        );
      }

      console.log("Personagem excluído com sucesso:", data);

      // Atualizar lista de personagens
      await refetchChars();

      // Fechar modal se o personagem excluído estava selecionado
      if (selectedCharacter?.id === charId) {
        setSelectedCharacter(null);
      }

      alert(
        `Personagem "${
          charToDelete?.name || "desconhecido"
        }" excluído com sucesso!`
      );
    } catch (error) {
      console.error("Erro ao excluir personagem:", error);

      // Mensagem de erro mais detalhada
      let errorMessage = `Erro ao excluir personagem:\n\n`;

      if (error.message) {
        errorMessage += `Mensagem: ${error.message}\n`;
      }

      if (error.code) {
        errorMessage += `Código: ${error.code}\n`;
      }

      if (error.details) {
        errorMessage += `Detalhes: ${error.details}\n`;
      }

      if (error.hint) {
        errorMessage += `Dica: ${error.hint}\n`;
      }

      errorMessage += `\nVerifique o console do navegador para mais detalhes.`;

      alert(errorMessage);
    }
  };

  const openFileViewer = (file) => {
    setSelectedFile(file);
  };

  const closeFileViewer = () => {
    setSelectedFile(null);
  };

  const renderViewer = () => {
    if (!selectedFile) return null;

    const viewerProps = {
      file: selectedFile,
      onClose: closeFileViewer,
    };

    switch (selectedFile.file_type) {
      case "markdown":
        return <MarkdownViewer {...viewerProps} />;
      case "audio":
        return <AudioPlayer {...viewerProps} />;
      case "video":
        return <VideoPlayer {...viewerProps} />;
      case "image":
        return <ImageViewer {...viewerProps} />;
      case "pdf":
        return <PDFViewer {...viewerProps} />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: "iniciativa", label: "Iniciativa", icon: <Sword size={20} /> },
    { id: "personagens", label: "Personagens", icon: <Users size={20} /> },
    { id: "investigacao", label: "Investigação", icon: <BookOpen size={20} /> },
    { id: "dados", label: "Dados", icon: <Dices size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary">
              Dashboard do Mestre
            </h1>
            <p className="text-textMuted mt-1">Bem-vindo, {character.name}</p>
          </div>
          <Button
            variant={session?.combat_mode ? "danger" : "primary"}
            onClick={toggleCombatMode}
            icon={<Sword size={20} />}
          >
            {session?.combat_mode ? "Desativar Combate" : "Ativar Combate"}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-textMuted hover:text-text"
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab === "iniciativa" && (
            <div className="space-y-4">
              <Card>
                <InitiativeCarousel
                  characters={initiativeCharacters}
                  currentTurnIndex={session?.current_turn_index || 0}
                  onNext={nextTurn}
                  onPrevious={previousTurn}
                  onSkip={skipTurn}
                  onReset={resetTurn}
                  onReorder={reorderInitiative}
                />
              </Card>

              {/* Botão para adicionar personagens à iniciativa */}
              <Card>
                <h3 className="text-lg font-semibold text-text mb-4">
                  Adicionar à Iniciativa
                </h3>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {characters
                    .filter((c) => !c.is_master)
                    .map((char) => {
                      const isInInitiative = initiativeCharacters.some(
                        (ic) => ic?.id === char.id
                      );
                      return (
                        <button
                          key={char.id}
                          onClick={async () => {
                            if (isInInitiative) {
                              // Remover da iniciativa
                              const newOrder = session.initiative_order.filter(
                                (id) => id !== char.id
                              );
                              await supabase
                                .from("game_session")
                                .update({ initiative_order: newOrder })
                                .eq("id", session.id);
                            } else {
                              // Adicionar à iniciativa
                              const newOrder = [
                                ...(session?.initiative_order || []),
                                char.id,
                              ];
                              await supabase
                                .from("game_session")
                                .update({ initiative_order: newOrder })
                                .eq("id", session.id);
                            }
                          }}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                            isInInitiative
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-surface hover:border-border/50"
                          }`}
                        >
                          {char.avatar_url ? (
                            <img
                              src={char.avatar_url}
                              alt={char.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              {char.character_type === "creature"
                                ? "🐉"
                                : char.character_type === "npc"
                                ? "👤"
                                : "🎭"}
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <div className="font-medium">{char.name}</div>
                            <div className="text-xs opacity-70">
                              {char.character_type === "player"
                                ? "Jogador"
                                : char.character_type === "npc"
                                ? "NPC"
                                : "Criatura"}
                            </div>
                          </div>
                          {isInInitiative && (
                            <span className="text-xs font-bold">✓</span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "personagens" && (
            <div className="space-y-6">
              {/* Botão Novo Personagem */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-text">
                  Gerenciar Personagens
                </h2>
                <Button
                  variant="primary"
                  onClick={() => setShowNewCharModal(true)}
                  icon={<Plus size={16} />}
                >
                  Novo Personagem
                </Button>
              </div>

              {/* Lista de Personagens */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {characters
                  .filter((c) => !c.is_master)
                  .map((char) => (
                    <Card
                      key={char.id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => setSelectedCharacter(char)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {char.avatar_url ? (
                              <img
                                src={char.avatar_url}
                                alt={char.name}
                                className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                                <div className="text-3xl">
                                  {char.character_type === "creature"
                                    ? "🐉"
                                    : char.character_type === "npc"
                                    ? "👤"
                                    : "🎭"}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-text truncate">
                                  {char.name}
                                </h3>
                                <span className="text-xs text-textMuted">
                                  {char.character_type === "player"
                                    ? "Jogador"
                                    : char.character_type === "npc"
                                    ? "NPC"
                                    : "Criatura"}
                                </span>
                              </div>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCharacter(char.id);
                                }}
                              >
                                Excluir
                              </Button>
                            </div>
                            <div className="text-sm text-textMuted mt-2">
                              <p>Atributos: {char.attributes?.length || 0}</p>
                              <p>Recursos: {char.resource_bars?.length || 0}</p>
                              {char.last_login && (
                                <p className="mt-2 text-xs">
                                  Último acesso:{" "}
                                  {new Date(
                                    char.last_login
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>

              {/* Editor do Personagem Selecionado */}
              {selectedCharacter && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-primary">
                      Editando: {selectedCharacter.name}
                    </h3>
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedCharacter(null)}
                    >
                      Fechar
                    </Button>
                  </div>

                  {/* Avatar e Visibilidade */}
                  <Card>
                    <h4 className="text-md font-semibold text-text mb-3">
                      Avatar e Visibilidade
                    </h4>
                    <div className="space-y-4">
                      {/* Avatar Atual */}
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {characters.find((c) => c.id === selectedCharacter.id)
                            ?.avatar_url ? (
                            <img
                              src={
                                characters.find(
                                  (c) => c.id === selectedCharacter.id
                                )?.avatar_url
                              }
                              alt={selectedCharacter.name}
                              className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                              <span className="text-4xl">
                                {selectedCharacter.character_type === "creature"
                                  ? "🐉"
                                  : selectedCharacter.character_type === "npc"
                                  ? "👤"
                                  : "🎭"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="block">
                            <span className="text-sm font-medium text-text mb-2 block">
                              Alterar Avatar
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                try {
                                  setUploadingAvatar(true);
                                  const fileExt = file.name.split(".").pop();
                                  const fileName = `${Date.now()}-${Math.random()
                                    .toString(36)
                                    .substring(7)}.${fileExt}`;
                                  const filePath = `avatars/${fileName}`;

                                  const { error: uploadError } =
                                    await supabase.storage
                                      .from("mag-files")
                                      .upload(filePath, file);

                                  if (uploadError) throw uploadError;

                                  const { data: urlData } = supabase.storage
                                    .from("mag-files")
                                    .getPublicUrl(filePath);

                                  await supabase
                                    .from("characters")
                                    .update({ avatar_url: urlData.publicUrl })
                                    .eq("id", selectedCharacter.id);

                                  await refetchChars();
                                  setSelectedCharacter((prev) => ({
                                    ...prev,
                                    avatar_url: urlData.publicUrl,
                                  }));
                                  alert("Avatar atualizado com sucesso!");
                                } catch (error) {
                                  console.error("Erro ao fazer upload:", error);
                                  alert("Erro ao atualizar avatar");
                                } finally {
                                  setUploadingAvatar(false);
                                }
                              }}
                              className="block w-full text-sm text-text
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-lg file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary file:text-white
                                hover:file:bg-primaryLight
                                file:cursor-pointer cursor-pointer"
                            />
                          </label>
                          {characters.find((c) => c.id === selectedCharacter.id)
                            ?.avatar_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                if (!confirm("Deseja remover o avatar atual?"))
                                  return;
                                await supabase
                                  .from("characters")
                                  .update({ avatar_url: null })
                                  .eq("id", selectedCharacter.id);
                                await refetchChars();
                                setSelectedCharacter((prev) => ({
                                  ...prev,
                                  avatar_url: null,
                                }));
                              }}
                              className="mt-2"
                            >
                              Remover Avatar
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Visibilidade */}
                      <div className="border-t border-border pt-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              !(
                                characters.find(
                                  (c) => c.id === selectedCharacter.id
                                )?.is_hidden || false
                              )
                            }
                            onChange={async (e) => {
                              const isVisible = e.target.checked;
                              await supabase
                                .from("characters")
                                .update({ is_hidden: !isVisible })
                                .eq("id", selectedCharacter.id);
                              await refetchChars();
                              setSelectedCharacter((prev) => ({
                                ...prev,
                                is_hidden: !isVisible,
                              }));
                            }}
                            className="w-5 h-5 rounded border-border"
                          />
                          <div>
                            <span className="text-sm font-medium text-text">
                              Visível para jogadores
                            </span>
                            <p className="text-xs text-textMuted mt-1">
                              {characters.find(
                                (c) => c.id === selectedCharacter.id
                              )?.is_hidden
                                ? "Este personagem está oculto dos jogadores"
                                : "Este personagem é visível para todos os jogadores"}
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </Card>

                  {/* Tipo de Personagem */}
                  <Card>
                    <h4 className="text-md font-semibold text-text mb-3">
                      Tipo de Personagem
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          await supabase
                            .from("characters")
                            .update({ character_type: "player" })
                            .eq("id", selectedCharacter.id);
                          await refetchChars();
                          setSelectedCharacter((prev) => ({
                            ...prev,
                            character_type: "player",
                          }));
                        }}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          (characters.find((c) => c.id === selectedCharacter.id)
                            ?.character_type || "player") === "player"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-surface text-textMuted hover:border-border/50"
                        }`}
                      >
                        <div className="text-2xl mb-1">🎭</div>
                        <div className="text-xs font-medium">Jogador</div>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await supabase
                            .from("characters")
                            .update({ character_type: "npc" })
                            .eq("id", selectedCharacter.id);
                          await refetchChars();
                          setSelectedCharacter((prev) => ({
                            ...prev,
                            character_type: "npc",
                          }));
                        }}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          (characters.find((c) => c.id === selectedCharacter.id)
                            ?.character_type || "player") === "npc"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-surface text-textMuted hover:border-border/50"
                        }`}
                      >
                        <div className="text-2xl mb-1">👤</div>
                        <div className="text-xs font-medium">NPC</div>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await supabase
                            .from("characters")
                            .update({ character_type: "creature" })
                            .eq("id", selectedCharacter.id);
                          await refetchChars();
                          setSelectedCharacter((prev) => ({
                            ...prev,
                            character_type: "creature",
                          }));
                        }}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          (characters.find((c) => c.id === selectedCharacter.id)
                            ?.character_type || "player") === "creature"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-surface text-textMuted hover:border-border/50"
                        }`}
                      >
                        <div className="text-2xl mb-1">🐉</div>
                        <div className="text-xs font-medium">Criatura</div>
                      </button>
                    </div>
                  </Card>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                      <AttributeList
                        attributes={
                          characters.find((c) => c.id === selectedCharacter.id)
                            ?.attributes || []
                        }
                        onChange={async (newAttrs) => {
                          await supabase
                            .from("characters")
                            .update({ attributes: newAttrs })
                            .eq("id", selectedCharacter.id);
                          await refetchChars();
                          setSelectedCharacter((prev) => ({
                            ...prev,
                            attributes: newAttrs,
                          }));
                        }}
                      />
                    </Card>
                    <Card>
                      <ResourceBarList
                        resources={
                          characters.find((c) => c.id === selectedCharacter.id)
                            ?.resource_bars || []
                        }
                        onChange={async (newResources) => {
                          await supabase
                            .from("characters")
                            .update({ resource_bars: newResources })
                            .eq("id", selectedCharacter.id);
                          await refetchChars();
                          setSelectedCharacter((prev) => ({
                            ...prev,
                            resource_bars: newResources,
                          }));
                        }}
                      />
                    </Card>
                    <Card className="lg:col-span-2">
                      <NotesEditor
                        notes={
                          characters.find((c) => c.id === selectedCharacter.id)
                            ?.notes || ""
                        }
                        onChange={async (newNotes) => {
                          await supabase
                            .from("characters")
                            .update({ notes: newNotes })
                            .eq("id", selectedCharacter.id);
                          await refetchChars();
                          setSelectedCharacter((prev) => ({
                            ...prev,
                            notes: newNotes,
                          }));
                        }}
                      />
                    </Card>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "investigacao" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => setShowNewCaseModal(true)}
                  icon={<Plus size={16} />}
                >
                  Novo Caso
                </Button>
              </div>

              <InvestigationTree
                cases={cases}
                folders={folders}
                files={files}
                onFileClick={openFileViewer}
                onAddCase={() => setShowNewCaseModal(true)}
                onAddFolder={(caseOrFolder) => {
                  setSelectedCase(caseOrFolder);
                  setShowNewFolderModal(true);
                }}
                onAddFile={(folder) => {
                  setSelectedFolder(folder);
                  setShowUploadModal(true);
                }}
                onDeleteCase={deleteCase}
                onDeleteFolder={deleteFolder}
                onDeleteFile={deleteFile}
                onShareCase={handleShareCase}
                onShareFile={handleShareFile}
                canEdit={true}
              />
            </div>
          )}

          {activeTab === "dados" && (
            <DiceRoller
              character={character}
              onRoll={(rollData) => addRoll(character, rollData)}
              rolls={rolls}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showNewCaseModal}
        onClose={() => setShowNewCaseModal(false)}
        title="Novo Caso de Investigação"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Nome do Caso"
            value={newCaseName}
            onChange={(e) => setNewCaseName(e.target.value)}
            placeholder="Ex: Caso 01: A Mansão Abandonada"
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowNewCaseModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateCase}
              className="flex-1"
            >
              Criar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
        title="Nova Pasta"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Nome da Pasta"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Ex: Pistas Físicas"
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowNewFolderModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateFolder}
              className="flex-1"
            >
              Criar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Novo Personagem */}
      <Modal
        isOpen={showNewCharModal}
        onClose={() => {
          setShowNewCharModal(false);
          setAvatarFile(null);
          setAvatarPreview(null);
        }}
        title="Novo Personagem"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Nome do Personagem"
            value={newCharName}
            onChange={(e) => setNewCharName(e.target.value)}
            placeholder="Ex: Ragnar o Bárbaro"
          />

          {/* Tipo de Personagem */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text">
              Tipo de Personagem
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setNewCharType("player")}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  newCharType === "player"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface text-textMuted hover:border-border/50"
                }`}
              >
                <div className="text-2xl mb-1">🎭</div>
                <div className="text-xs font-medium">Jogador</div>
              </button>
              <button
                type="button"
                onClick={() => setNewCharType("npc")}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  newCharType === "npc"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface text-textMuted hover:border-border/50"
                }`}
              >
                <div className="text-2xl mb-1">👤</div>
                <div className="text-xs font-medium">NPC</div>
              </button>
              <button
                type="button"
                onClick={() => setNewCharType("creature")}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  newCharType === "creature"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface text-textMuted hover:border-border/50"
                }`}
              >
                <div className="text-2xl mb-1">🐉</div>
                <div className="text-xs font-medium">Criatura</div>
              </button>
            </div>
          </div>

          {/* Avatar Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text">
              Imagem do Personagem (opcional)
            </label>
            <div className="flex items-center gap-4">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-surface border-2 border-border flex items-center justify-center">
                  <Users size={32} className="text-textMuted" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="text-sm text-textMuted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white hover:file:bg-primary/90 file:cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowNewCharModal(false);
                setAvatarFile(null);
                setAvatarPreview(null);
              }}
              className="flex-1"
              disabled={uploadingAvatar}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateCharacter}
              className="flex-1"
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? "Criando..." : "Criar"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          if (!uploading) {
            setShowUploadModal(false);
            setUploadProgress([]);
            setUploadError("");
          }
        }}
        title="📤 Upload de Múltiplos Arquivos"
        size="md"
      >
        <div className="space-y-4">
          {/* Info */}
          <div className="bg-surface border border-border rounded-lg p-4 space-y-2">
            <p className="text-sm text-textMuted">
              <strong className="text-text">Pasta selecionada:</strong>{" "}
              {selectedFolder?.name}
            </p>
            <div className="flex items-center gap-2 text-xs text-primary">
              <Upload size={14} />
              <span className="font-medium">
                Você pode selecionar e enviar vários arquivos de uma vez
              </span>
            </div>
          </div>

          {/* Upload Area com Drag & Drop */}
          {uploadProgress.length === 0 && (
            <FileDropzone
              onFilesSelected={handleFileUpload}
              multiple={true}
              accept=".md,.mp3,.wav,.ogg,.mp4,.webm,.mov,.jpg,.jpeg,.png,.gif,.webp,.pdf"
              disabled={uploading}
            />
          )}

          {/* Progress List */}
          {uploadProgress.length > 0 && (
            <div className="space-y-3">
              {/* Resumo do Upload */}
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="text-primary" size={20} />
                    <span className="font-semibold text-text">
                      Enviando {uploadProgress.length} arquivo
                      {uploadProgress.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="text-sm text-textMuted">
                    {
                      uploadProgress.filter((f) => f.status === "complete")
                        .length
                    }
                    /{uploadProgress.length} completo
                    {uploadProgress.filter((f) => f.status === "complete")
                      .length !== 1
                      ? "s"
                      : ""}
                  </div>
                </div>
                {uploadProgress.filter((f) => f.status === "error").length >
                  0 && (
                  <div className="mt-2 text-xs text-red-400">
                    ⚠️{" "}
                    {uploadProgress.filter((f) => f.status === "error").length}{" "}
                    arquivo
                    {uploadProgress.filter((f) => f.status === "error").length >
                    1
                      ? "s"
                      : ""}{" "}
                    com erro
                  </div>
                )}
              </div>

              {/* Lista de Progresso */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uploadProgress.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-surface border border-border rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-text font-medium truncate flex-1">
                        {item.name}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          item.status === "complete"
                            ? "bg-green-500/20 text-green-400"
                            : item.status === "error"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {item.status === "complete"
                          ? "✓ Completo"
                          : item.status === "error"
                          ? "✗ Erro"
                          : "⟳ Enviando..."}
                      </span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          item.status === "complete"
                            ? "bg-green-500"
                            : item.status === "error"
                            ? "bg-red-500"
                            : "bg-primary"
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
              {uploadError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowUploadModal(false);
                setUploadProgress([]);
                setUploadError("");
              }}
              className="flex-1"
              disabled={uploading}
            >
              {uploading ? "Aguarde..." : "Fechar"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* File Viewer */}
      {renderViewer()}

      {/* Modal Compartilhar Caso */}
      {showShareCaseModal && selectedCaseForShare && (
        <ShareModal
          isOpen={showShareCaseModal}
          onClose={() => setShowShareCaseModal(false)}
          title={`Compartilhar: ${selectedCaseForShare.name}`}
          currentSharedWith={selectedCaseForShare.shared_with || ["all"]}
          availableCharacters={characters.filter((c) => !c.is_master)}
          onSave={handleUpdateCaseSharing}
        />
      )}

      {/* Modal Compartilhar Arquivo */}
      {showShareFileModal && selectedFileForShare && (
        <ShareModal
          isOpen={showShareFileModal}
          onClose={() => setShowShareFileModal(false)}
          title={`Compartilhar: ${selectedFileForShare.file_name}`}
          currentSharedWith={selectedFileForShare.shared_with || ["all"]}
          availableCharacters={characters.filter((c) => !c.is_master)}
          onSave={handleUpdateFileSharing}
        />
      )}
    </div>
  );
};

export default MasterDashboard;
