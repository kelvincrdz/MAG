import React, { useState, useEffect } from "react";
import { User, BookOpen, Dices, Bell } from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import AttributeList from "../components/characters/AttributeList";
import ResourceBarList from "../components/characters/ResourceBarList";
import NotesEditor from "../components/characters/NotesEditor";
import InvestigationTree from "../components/investigation/InvestigationTree";
import DiceRoller from "../components/dice/DiceRoller";
import MarkdownViewer from "../components/investigation/viewers/MarkdownViewer";
import AudioPlayer from "../components/investigation/viewers/AudioPlayer";
import VideoPlayer from "../components/investigation/viewers/VideoPlayer";
import ImageViewer from "../components/investigation/viewers/ImageViewer";
import PDFViewer from "../components/investigation/viewers/PDFViewer";
import { useCharacter } from "../hooks/useCharacter";
import { useGameSession } from "../hooks/useGameSession";
import { useInvestigation } from "../hooks/useInvestigation";
import { useRealtime, useDiceRolls } from "../hooks/useRealtime";

const PlayerDashboard = ({ character }) => {
  const [activeTab, setActiveTab] = useState("personagem");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(false);

  const {
    character: currentChar,
    updateAttributes,
    updateResourceBars,
    updateNotes,
  } = useCharacter(character.id);
  const { session } = useGameSession();
  const { cases, folders, files, viewedFiles, markFileAsViewed } =
    useInvestigation(character.id);
  const { rolls, addRoll } = useDiceRolls();

  // Check if it's player's turn
  useEffect(() => {
    if (
      session &&
      session.initiative_order &&
      session.initiative_order.length > 0
    ) {
      const currentTurnCharId =
        session.initiative_order[session.current_turn_index];
      setIsMyTurn(currentTurnCharId === character.id);
    }
  }, [session, character.id]);

  // Setup realtime
  useRealtime({
    onSessionUpdate: () => {},
    onNewFile: () => {},
    onNewRoll: () => {},
  });

  const openFileViewer = (file) => {
    setSelectedFile(file);
    markFileAsViewed(file.id);
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
    { id: "personagem", label: "Meu Personagem", icon: <User size={20} /> },
    { id: "investigacao", label: "Investigação", icon: <BookOpen size={20} /> },
    { id: "dados", label: "Dados", icon: <Dices size={20} /> },
  ];

  // Filtrar casos compartilhados com o jogador
  const filteredCases = cases.filter((c) => {
    return (
      c.shared_with &&
      (c.shared_with.includes("all") || c.shared_with.includes(character.id))
    );
  });

  const unviewedCount = files.filter((f) => {
    // Verifica se o arquivo foi compartilhado com o jogador
    const isFileShared =
      f.shared_with &&
      (f.shared_with.includes("all") || f.shared_with.includes(character.id));

    // Encontra a pasta do arquivo
    const folder = folders.find((fold) => fold.id === f.folder_id);
    if (!folder) return false;

    // Encontra o caso da pasta
    const caseItem = cases.find((c) => c.id === folder.case_id);
    if (!caseItem) return false;

    // Verifica se o caso foi compartilhado com o jogador
    const isCaseShared =
      caseItem &&
      caseItem.shared_with &&
      (caseItem.shared_with.includes("all") ||
        caseItem.shared_with.includes(character.id));

    // Retorna true apenas se o arquivo não foi visto E ambos (arquivo e caso) foram compartilhados
    return !viewedFiles.includes(f.id) && isFileShared && isCaseShared;
  }).length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary">Meu Personagem</h1>
            <p className="text-textMuted mt-1">Bem-vindo, {character.name}</p>
          </div>

          {/* Turn Alert */}
          {isMyTurn && session?.combat_mode && (
            <div className="animate-pulse-subtle">
              <Card highlight className="px-6 py-3">
                <div className="flex items-center gap-3">
                  <Bell className="text-primary" size={24} />
                  <div>
                    <p className="text-primary font-bold text-lg">
                      É SEU TURNO!
                    </p>
                    <p className="text-textMuted text-sm">Modo combate ativo</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 font-medium transition-colors relative
                ${
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-textMuted hover:text-text"
                }
              `}
            >
              {tab.icon}
              {tab.label}
              {tab.id === "investigacao" && unviewedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unviewedCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab === "personagem" && currentChar && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <AttributeList
                  attributes={currentChar.attributes || []}
                  onChange={updateAttributes}
                />
              </Card>
              <Card>
                <ResourceBarList
                  resources={currentChar.resource_bars || []}
                  onChange={updateResourceBars}
                />
              </Card>
              <Card className="lg:col-span-2">
                <NotesEditor
                  notes={currentChar.notes || ""}
                  onChange={updateNotes}
                  readOnly={false}
                />
              </Card>
            </div>
          )}

          {activeTab === "investigacao" && (
            <div className="space-y-4">
              {unviewedCount > 0 && (
                <Card className="bg-primary/10 border-primary">
                  <p className="text-primary font-semibold">
                    🆕 Você tem {unviewedCount}{" "}
                    {unviewedCount === 1 ? "arquivo novo" : "arquivos novos"}!
                  </p>
                </Card>
              )}

              <InvestigationTree
                cases={filteredCases}
                folders={folders.filter((folder) => {
                  const caseItem = cases.find((c) => c.id === folder.case_id);
                  return (
                    caseItem &&
                    caseItem.shared_with &&
                    (caseItem.shared_with.includes("all") ||
                      caseItem.shared_with.includes(character.id))
                  );
                })}
                files={files.filter((f) => {
                  const folder = folders.find(
                    (fold) => fold.id === f.folder_id
                  );
                  if (!folder) return false;
                  const caseItem = cases.find((c) => c.id === folder.case_id);
                  const isFileShared =
                    f.shared_with &&
                    (f.shared_with.includes("all") ||
                      f.shared_with.includes(character.id));
                  const isCaseShared =
                    caseItem &&
                    caseItem.shared_with &&
                    (caseItem.shared_with.includes("all") ||
                      caseItem.shared_with.includes(character.id));
                  return isFileShared && isCaseShared;
                })}
                onFileClick={openFileViewer}
                viewedFiles={viewedFiles}
                characterId={character.id}
                canEdit={false}
              />
            </div>
          )}

          {activeTab === "dados" && (
            <DiceRoller
              character={character}
              onRoll={(rollData) => addRoll(character, rollData)}
              rolls={rolls.filter((r) => !r.is_private || character.is_master)}
            />
          )}
        </div>
      </div>

      {/* File Viewer */}
      {renderViewer()}
    </div>
  );
};

export default PlayerDashboard;
