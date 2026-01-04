import React, { useState } from "react";
import { Users, Lock, Globe, X, Check } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Badge from "../common/Badge";

const ShareModal = ({
  isOpen,
  onClose,
  onSave,
  title,
  currentSharedWith = [],
  availableCharacters = [],
}) => {
  const [selectedCharacters, setSelectedCharacters] = useState(
    currentSharedWith.filter((id) => id !== "all")
  );
  const [shareWithAll, setShareWithAll] = useState(
    currentSharedWith.includes("all")
  );

  const toggleCharacter = (charId) => {
    setSelectedCharacters((prev) =>
      prev.includes(charId)
        ? prev.filter((id) => id !== charId)
        : [...prev, charId]
    );
  };

  const handleSave = () => {
    const sharedWith = shareWithAll ? ["all"] : selectedCharacters;
    onSave(sharedWith);
  };

  const handleShareWithAll = () => {
    setShareWithAll(!shareWithAll);
    if (!shareWithAll) {
      setSelectedCharacters([]);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        {/* Compartilhar com Todos */}
        <div
          onClick={handleShareWithAll}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            shareWithAll
              ? "border-primary bg-primary/10"
              : "border-border hover:border-border/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  shareWithAll ? "bg-primary/20" : "bg-surface"
                }`}
              >
                <Globe
                  className={shareWithAll ? "text-primary" : "text-textMuted"}
                  size={24}
                />
              </div>
              <div>
                <h4
                  className={`font-semibold ${
                    shareWithAll ? "text-primary" : "text-text"
                  }`}
                >
                  Compartilhar com Todos
                </h4>
                <p className="text-sm text-textMuted">
                  Todos os jogadores terão acesso
                </p>
              </div>
            </div>
            {shareWithAll && (
              <Check className="text-primary" size={24} strokeWidth={3} />
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-sm text-textMuted">OU</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        {/* Compartilhamento Seletivo */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="text-primary" size={20} />
            <h4 className="font-semibold text-text">
              Compartilhar com Jogadores Específicos
            </h4>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableCharacters.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-textMuted">Nenhum jogador disponível</p>
              </div>
            ) : (
              availableCharacters.map((char) => {
                const isSelected = selectedCharacters.includes(char.id);
                const isDisabled = shareWithAll;

                return (
                  <div
                    key={char.id}
                    onClick={() => !isDisabled && toggleCharacter(char.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isDisabled
                        ? "opacity-50 cursor-not-allowed border-border"
                        : isSelected
                        ? "border-primary bg-primary/10 cursor-pointer"
                        : "border-border hover:border-border/50 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {char.avatar_url ? (
                          <img
                            src={char.avatar_url}
                            alt={char.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Users className="text-primary" size={20} />
                          </div>
                        )}
                        <div>
                          <h5
                            className={`font-medium ${
                              isSelected && !isDisabled
                                ? "text-primary"
                                : "text-text"
                            }`}
                          >
                            {char.name}
                          </h5>
                          <p className="text-xs text-textMuted">
                            {char.character_type === "player"
                              ? "Jogador"
                              : "NPC"}
                          </p>
                        </div>
                      </div>
                      {isSelected && !isDisabled && (
                        <Check
                          className="text-primary"
                          size={24}
                          strokeWidth={3}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Resumo */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <h5 className="font-semibold text-text mb-2">
            Resumo do Compartilhamento
          </h5>
          <div className="flex flex-wrap gap-2">
            {shareWithAll ? (
              <Badge color="#2c3638">
                <Globe size={14} className="mr-1" />
                Todos os jogadores
              </Badge>
            ) : selectedCharacters.length === 0 ? (
              <Badge color="#b1343c">
                <Lock size={14} className="mr-1" />
                Nenhum jogador selecionado
              </Badge>
            ) : (
              <>
                <Badge color="#c97d0d">
                  <Lock size={14} className="mr-1" />
                  {selectedCharacters.length}{" "}
                  {selectedCharacters.length === 1 ? "jogador" : "jogadores"}
                </Badge>
                {selectedCharacters.map((charId) => {
                  const char = availableCharacters.find((c) => c.id === charId);
                  return char ? (
                    <Badge key={charId} color="#2c3638">
                      {char.name}
                    </Badge>
                  ) : null;
                })}
              </>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!shareWithAll && selectedCharacters.length === 0}
          >
            Salvar Compartilhamento
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;
