import React, { useState, useMemo } from "react";
import {
  Folder,
  FolderOpen,
  File,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  Share2,
  Search,
  Eye,
  X,
  Filter,
  FileText,
  Music,
  Video,
  Image,
  FileType,
} from "lucide-react";
import Button from "../common/Button";
import Badge from "../common/Badge";
import Input from "../common/Input";

const getFileIcon = (type) => {
  const icons = {
    markdown: <FileText size={20} className="text-blue-400" />,
    audio: <Music size={20} className="text-purple-400" />,
    video: <Video size={20} className="text-red-400" />,
    image: <Image size={20} className="text-green-400" />,
    pdf: <FileType size={20} className="text-orange-400" />,
  };
  return icons[type] || <File size={20} className="text-gray-400" />;
};

const FileNode = ({
  file,
  onClick,
  showNew,
  onShare,
  onDelete,
  canEdit,
  onPreview,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      <div
        onClick={() => onClick(file)}
        className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer group ${
          showNew
            ? "bg-green-500/10 border border-green-500/30 hover:bg-green-500/20"
            : "hover:bg-surfaceHover border border-transparent hover:border-border"
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">{getFileIcon(file.file_type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-text truncate font-medium ${
                  showNew ? "text-green-400" : ""
                }`}
              >
                {file.file_name}
              </span>
              {showNew && (
                <Badge color="#2c3638" size="sm">
                  Novo
                </Badge>
              )}
              {file.shared_with && !file.shared_with.includes("all") && (
                <Badge color="#c97d0d" size="sm">
                  Restrito
                </Badge>
              )}
              {file.shared_with && file.shared_with.includes("all") && (
                <Badge color="#2c3638" size="sm">
                  Todos
                </Badge>
              )}
            </div>
            {file.description && (
              <p className="text-xs text-textMuted mt-1 truncate">
                {file.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onPreview && (
            <Button
              variant="icon"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(file);
              }}
              icon={<Eye size={16} />}
              className={`transition-opacity ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
          {canEdit && (
            <>
              <Button
                variant="icon"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(file);
                }}
                icon={<Share2 size={16} />}
                className={`transition-opacity ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              />
              <Button
                variant="icon"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    confirm(
                      `Tem certeza que deseja excluir o arquivo "${file.file_name}"?`
                    )
                  ) {
                    onDelete(file.id);
                  }
                }}
                icon={<Trash2 size={16} className="text-red-400" />}
                className={`transition-opacity ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const FolderNode = ({
  folder,
  files = [],
  subfolders = [],
  onFileClick,
  onAddFile,
  onAddFolder,
  onDeleteFolder,
  onDeleteFile,
  onShareFile,
  getUnviewedCount,
  canEdit,
  level = 0,
}) => {
  const [isOpen, setIsOpen] = useState(level === 0);
  const unviewedCount = getUnviewedCount ? getUnviewedCount(folder.id) : 0;

  return (
    <div className={`${level > 0 ? "ml-6" : ""}`}>
      {/* Folder Header */}
      <div className="flex items-center justify-between p-2 rounded hover:bg-surfaceHover group transition-colors">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          {isOpen ? (
            <FolderOpen className="text-primary" size={20} />
          ) : (
            <Folder className="text-primary" size={20} />
          )}
          <span className="text-text font-semibold">{folder.name}</span>
          {unviewedCount > 0 && (
            <Badge color="#2c3638" size="sm">
              {unviewedCount} novos
            </Badge>
          )}
        </button>

        {canEdit && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="icon"
              size="sm"
              onClick={() => onAddFile(folder)}
              icon={<Plus size={14} />}
            />
            <Button
              variant="icon"
              size="sm"
              onClick={() => onAddFolder(folder)}
              icon={<Folder size={14} />}
            />
            <Button
              variant="icon"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (
                  confirm(
                    `Tem certeza que deseja excluir a pasta "${folder.name}"? Todos os arquivos serão excluídos.`
                  )
                ) {
                  onDeleteFolder(folder.id);
                }
              }}
              icon={<Trash2 size={14} className="text-red-400" />}
            />
          </div>
        )}
      </div>

      {/* Folder Contents */}
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1">
          {/* Subfolders */}
          {subfolders.map((subfolder) => (
            <FolderNode
              key={subfolder.id}
              folder={subfolder}
              files={files.filter((f) => f.folder_id === subfolder.id)}
              subfolders={subfolders.filter(
                (sf) => sf.parent_folder_id === subfolder.id
              )}
              onFileClick={onFileClick}
              onAddFile={onAddFile}
              onAddFolder={onAddFolder}
              onDeleteFolder={onDeleteFolder}
              onDeleteFile={onDeleteFile}
              onShareFile={onShareFile}
              getUnviewedCount={getUnviewedCount}
              canEdit={canEdit}
              level={level + 1}
            />
          ))}

          {/* Files */}
          {files
            .filter((f) => f.folder_id === folder.id)
            .map((file) => (
              <FileNode
                key={file.id}
                file={file}
                onClick={onFileClick}
                showNew={
                  getUnviewedCount ? getUnviewedCount(file.id) > 0 : false
                }
                onShare={onShareFile}
                onDelete={onDeleteFile}
                canEdit={canEdit}
                onPreview={onFileClick}
              />
            ))}

          {files.filter((f) => f.folder_id === folder.id).length === 0 &&
            subfolders.filter((sf) => sf.parent_folder_id === folder.id)
              .length === 0 && (
              <p className="text-textDim text-sm italic p-2">Pasta vazia</p>
            )}
        </div>
      )}
    </div>
  );
};

const InvestigationTree = ({
  cases = [],
  folders = [],
  files = [],
  onFileClick,
  onAddCase,
  onAddFolder,
  onAddFile,
  onDeleteCase,
  onDeleteFolder,
  onDeleteFile,
  onShareFile,
  onShareCase,
  viewedFiles = [],
  characterId,
  canEdit = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, new, shared
  const [expandedCases, setExpandedCases] = useState(new Set());

  // Toggle case expansion
  const toggleCase = (caseId) => {
    setExpandedCases((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(caseId)) {
        newSet.delete(caseId);
      } else {
        newSet.add(caseId);
      }
      return newSet;
    });
  };

  // Filtrar arquivos com busca
  const filteredFiles = useMemo(() => {
    let result = files;

    // Busca por nome
    if (searchQuery) {
      result = result.filter((f) =>
        f.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por tipo
    if (filterType === "new") {
      result = result.filter((f) => !viewedFiles.includes(f.id));
    } else if (filterType === "shared") {
      result = result.filter((f) => !f.shared_with.includes("all"));
    }

    return result;
  }, [files, searchQuery, filterType, viewedFiles]);

  const getUnviewedCount = (id) => {
    // Check if this is a file
    const file = files.find((f) => f.id === id);
    if (file) {
      return viewedFiles.includes(id) ? 0 : 1;
    }

    // Check files in this folder
    const folderFiles = files.filter((f) => f.folder_id === id);
    return folderFiles.filter((f) => !viewedFiles.includes(f.id)).length;
  };

  return (
    <div className="space-y-4">
      {/* Barra de Busca e Filtros */}
      {cases.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder=" Buscar arquivos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search size={16} />}
              />
            </div>
            {canEdit && (
              <Button
                variant="primary"
                onClick={onAddCase}
                icon={<Plus size={16} />}
              >
                Novo Caso
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant={filterType === "all" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              Todos
            </Button>
            <Button
              variant={filterType === "new" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setFilterType("new")}
              icon={
                <Badge color="#2c3638" size="sm">
                  Novo
                </Badge>
              }
            >
              Não Vistos
            </Button>
            <Button
              variant={filterType === "shared" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setFilterType("shared")}
            >
              Restritos
            </Button>
          </div>
        </div>
      )}

      {cases.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-textMuted mb-4">Nenhum caso criado ainda</p>
          {canEdit && (
            <Button
              variant="primary"
              onClick={onAddCase}
              icon={<Plus size={16} />}
            >
              Criar Primeiro Caso
            </Button>
          )}
        </div>
      ) : (
        cases.map((caseItem) => {
          const caseFolders = folders.filter(
            (f) => f.case_id === caseItem.id && !f.parent_folder_id
          );
          const caseFiles = filteredFiles.filter((f) => {
            const folder = folders.find((fold) => fold.id === f.folder_id);
            return folder && folder.case_id === caseItem.id;
          });
          const allCaseFiles = files.filter((f) => {
            const folder = folders.find((fold) => fold.id === f.folder_id);
            return folder && folder.case_id === caseItem.id;
          });
          const unviewedTotal = allCaseFiles.filter(
            (f) => !viewedFiles.includes(f.id)
          ).length;
          const isExpanded =
            expandedCases.has(caseItem.id) ||
            searchQuery ||
            filterType !== "all";

          // Se não há arquivos após o filtro, não mostrar o caso
          if (searchQuery && caseFiles.length === 0) return null;

          return (
            <div
              key={caseItem.id}
              className="bg-surface border border-border rounded-lg overflow-hidden transition-all duration-200 hover:border-primary/30"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => toggleCase(caseItem.id)}
                    className="flex items-center gap-3 flex-1 text-left group"
                  >
                    {isExpanded ? (
                      <ChevronDown
                        className="text-primary transition-transform"
                        size={20}
                      />
                    ) : (
                      <ChevronRight
                        className="text-primary transition-transform"
                        size={20}
                      />
                    )}
                    <h3 className="text-xl font-bold text-primary group-hover:text-primaryLight transition-colors">
                      {caseItem.name}
                    </h3>
                    {unviewedTotal > 0 && (
                      <Badge color="#2c3638">
                        {unviewedTotal} novo{unviewedTotal > 1 ? "s" : ""}
                      </Badge>
                    )}
                    {caseItem.shared_with &&
                      !caseItem.shared_with.includes("all") && (
                        <Badge color="#c97d0d" size="sm">
                          Restrito
                        </Badge>
                      )}
                    {caseItem.shared_with &&
                      caseItem.shared_with.includes("all") && (
                        <Badge color="#8b5cf6" size="sm">
                          Todos
                        </Badge>
                      )}
                  </button>
                  {canEdit && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onShareCase && onShareCase(caseItem)}
                        icon={<Share2 size={16} />}
                      >
                        Compartilhar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddFolder(caseItem, null)}
                        icon={<Folder size={16} />}
                      >
                        Nova Pasta
                      </Button>
                      <Button
                        variant="icon"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            confirm(
                              `Tem certeza que deseja excluir o caso "${caseItem.name}"? Todas as pastas e arquivos serão excluídos.`
                            )
                          ) {
                            onDeleteCase(caseItem.id);
                          }
                        }}
                        icon={<Trash2 size={16} className="text-red-400" />}
                      />
                    </div>
                  )}
                </div>

                {caseItem.description && (
                  <p className="text-textMuted text-sm mb-3">
                    {caseItem.description}
                  </p>
                )}
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-1">
                  {caseFolders.map((folder) => (
                    <FolderNode
                      key={folder.id}
                      folder={folder}
                      files={caseFiles}
                      subfolders={folders.filter(
                        (f) => f.parent_folder_id === folder.id
                      )}
                      onFileClick={onFileClick}
                      onAddFile={onAddFile}
                      onAddFolder={onAddFolder}
                      onDeleteFolder={onDeleteFolder}
                      onDeleteFile={onDeleteFile}
                      onShareFile={onShareFile}
                      getUnviewedCount={getUnviewedCount}
                      canEdit={canEdit}
                    />
                  ))}

                  {caseFolders.length === 0 && (
                    <p className="text-textMuted text-sm italic p-2">
                      Nenhuma pasta neste caso ainda
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default InvestigationTree;
