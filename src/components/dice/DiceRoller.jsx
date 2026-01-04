import React, { useState } from "react";
import { Dices, Send, Eye, EyeOff } from "lucide-react";
import Button from "../common/Button";
import Input from "../common/Input";
import Card from "../common/Card";
import Badge from "../common/Badge";
import { rollExpression, parseDiceExpression } from "../../lib/diceParser";

const DiceButton = ({ sides, onClick }) => (
  <Button
    variant="secondary"
    size="sm"
    onClick={() => onClick(`1d${sides}`)}
    className="font-mono"
  >
    d{sides}
  </Button>
);

const RollResult = ({ roll }) => {
  const time = new Date(roll.created_at).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className={`${roll.is_private ? "border-yellow-500/50" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-primary">
              {roll.character_name}
            </span>
            <span className="text-textDim text-sm">{time}</span>
            {roll.is_private && (
              <Badge color="#f59e0b" size="sm">
                <Eye size={12} /> Privado
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            <div className="text-textMuted text-sm">
              Rolagem: <span className="font-mono">{roll.expression}</span>
            </div>

            {roll.details?.rolls && (
              <div className="text-sm text-textMuted">
                Dados: [{roll.details.rolls.join(", ")}]
                {roll.details.modifier !== 0 && (
                  <span>
                    {" "}
                    {roll.details.modifier > 0 ? "+" : ""}
                    {roll.details.modifier}
                  </span>
                )}
              </div>
            )}

            <div className="text-3xl font-bold text-text font-mono">
              = {roll.result}
              {roll.details?.isCritical && (
                <Badge
                  color={roll.result === 1 ? "#ef4444" : "#2c3638"}
                  className="ml-2"
                >
                  {roll.result === 1 ? "💀 FALHA CRÍTICA!" : "⭐ CRÍTICO!"}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const DiceRoller = ({ character, onRoll, rolls = [] }) => {
  const [expression, setExpression] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState("");

  const commonDice = [4, 6, 8, 10, 12, 20, 100];

  const handleRoll = async () => {
    try {
      setError("");

      if (!expression.trim()) {
        setError("Digite uma expressão de dados");
        return;
      }

      const parsed = parseDiceExpression(expression);
      if (!parsed) {
        setError("Expressão inválida. Use formato: 3d6+5");
        return;
      }

      const result = rollExpression(expression);

      await onRoll({
        expression,
        result: result.total,
        details: result,
        is_private: isPrivate && character.is_master,
      });

      setExpression("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQuickRoll = (exp) => {
    setExpression(exp);
    setTimeout(() => {
      const result = rollExpression(exp);
      onRoll({
        expression: exp,
        result: result.total,
        details: result,
        is_private: isPrivate && character.is_master,
      });
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Roller Interface */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Dices className="text-primary" size={24} />
            <h3 className="text-xl font-bold text-text">Rolar Dados</h3>
          </div>

          {/* Quick Dice Buttons */}
          <div className="flex flex-wrap gap-2">
            {commonDice.map((sides) => (
              <DiceButton key={sides} sides={sides} onClick={handleQuickRoll} />
            ))}
          </div>

          {/* Custom Expression */}
          <div className="flex gap-2">
            <Input
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="Ex: 3d6+5, 1d20-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRoll();
              }}
              error={error}
              className="flex-1"
            />
            <Button
              variant="primary"
              onClick={handleRoll}
              icon={<Send size={20} />}
            >
              Rolar
            </Button>
          </div>

          {/* Private Roll Toggle (only for master) */}
          {character.is_master && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="privateRoll"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-2 focus:ring-primary"
              />
              <label
                htmlFor="privateRoll"
                className="text-sm text-textMuted cursor-pointer"
              >
                Rolagem privada (só o mestre vê)
              </label>
            </div>
          )}

          {/* Help Text */}
          <div className="text-xs text-textDim">
            <p>Exemplos: 1d20, 3d6+5, 2d8-2, 1d100</p>
          </div>
        </div>
      </Card>

      {/* Roll History */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-text">Histórico de Rolagens</h3>

        {rolls.length === 0 ? (
          <Card>
            <p className="text-textMuted text-center py-4">
              Nenhuma rolagem ainda
            </p>
          </Card>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
            {rolls.map((roll) => (
              <RollResult key={roll.id} roll={roll} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiceRoller;
