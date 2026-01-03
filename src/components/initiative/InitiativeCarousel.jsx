import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  SkipForward,
  RotateCcw,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Button from "../common/Button";
import Card from "../common/Card";
import Badge from "../common/Badge";

const CharacterCard = ({
  character,
  isCurrent,
  onMoveUp,
  onMoveDown,
  showControls,
}) => {
  return (
    <Card
      highlight={isCurrent}
      className={`
        transition-all duration-300
        ${isCurrent ? "scale-100" : "scale-95 opacity-70"}
        ${!isCurrent && "hover:opacity-90"}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          {character.avatar_url ? (
            <img
              src={character.avatar_url}
              alt={character.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primaryLight flex items-center justify-center text-white font-bold text-2xl">
              {character.character_type === "creature"
                ? "🐉"
                : character.character_type === "npc"
                ? "👤"
                : character.name.charAt(0).toUpperCase()}
            </div>
          )}
          {/* Badge de tipo */}
          {character.character_type &&
            character.character_type !== "player" && (
              <div className="absolute -bottom-1 -right-1 bg-surface border border-border rounded-full px-1.5 py-0.5 text-xs">
                {character.character_type === "npc" ? "NPC" : "🐉"}
              </div>
            )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-text mb-1">{character.name}</h3>

          {/* Resource Bars Preview */}
          {character.resource_bars && character.resource_bars.length > 0 && (
            <div className="space-y-1">
              {character.resource_bars.slice(0, 2).map((bar) => (
                <div key={bar.id} className="text-sm">
                  <span className="text-textMuted">{bar.name}:</span>{" "}
                  <span className="font-mono text-text">
                    {bar.current}/{bar.max}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Attributes Preview */}
          {character.attributes && character.attributes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {character.attributes.slice(0, 3).map((attr) => (
                <Badge key={attr.id} color={attr.color} size="sm">
                  {attr.name} +{attr.value}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Move Controls */}
        {showControls && (
          <div className="flex flex-col gap-1">
            <Button
              variant="icon"
              size="sm"
              onClick={onMoveUp}
              icon={<ArrowUp size={16} />}
            />
            <Button
              variant="icon"
              size="sm"
              onClick={onMoveDown}
              icon={<ArrowDown size={16} />}
            />
          </div>
        )}
      </div>

      {/* Current Turn Label */}
      {isCurrent && (
        <div className="mt-4 pt-4 border-t border-primary/30 text-center">
          <span className="text-primary font-bold text-sm uppercase tracking-wider">
            🎯 Turno Atual
          </span>
        </div>
      )}
    </Card>
  );
};

const InitiativeCarousel = ({
  characters = [],
  currentTurnIndex = 0,
  onNext,
  onPrevious,
  onSkip,
  onReset,
  onReorder,
}) => {
  const currentCharacter = characters[currentTurnIndex];

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newOrder = [...characters];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index - 1];
    newOrder[index - 1] = temp;
    onReorder(newOrder);
  };

  const handleMoveDown = (index) => {
    if (index === characters.length - 1) return;
    const newOrder = [...characters];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + 1];
    newOrder[index + 1] = temp;
    onReorder(newOrder);
  };

  if (characters.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-textMuted text-lg">
          Nenhum personagem na iniciativa ainda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="secondary"
          onClick={onPrevious}
          disabled={currentTurnIndex === 0}
          icon={<ChevronLeft size={20} />}
        >
          Anterior
        </Button>

        <Button
          variant="primary"
          onClick={onNext}
          icon={<ChevronRight size={20} />}
        >
          Próximo
        </Button>

        <Button
          variant="ghost"
          onClick={onSkip}
          icon={<SkipForward size={20} />}
        >
          Pular
        </Button>

        <Button
          variant="ghost"
          onClick={onReset}
          icon={<RotateCcw size={20} />}
        >
          Resetar
        </Button>
      </div>

      {/* Turn Counter */}
      <div className="text-center">
        <span className="text-textMuted">
          Turno {currentTurnIndex + 1} de {characters.length}
        </span>
      </div>

      {/* Character Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {characters.map((char, index) => (
          <CharacterCard
            key={char.id}
            character={char}
            isCurrent={index === currentTurnIndex}
            onMoveUp={() => handleMoveUp(index)}
            onMoveDown={() => handleMoveDown(index)}
            showControls={true}
          />
        ))}
      </div>
    </div>
  );
};

export default InitiativeCarousel;
