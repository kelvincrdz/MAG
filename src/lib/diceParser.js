// Parser de expressões de dados: "3d6+5", "1d20-2", etc.
export const parseDiceExpression = (expression) => {
  try {
    // Remove espaços
    const exp = expression.replace(/\s/g, "");

    // Regex para capturar: quantidade de dados, tipo de dado, modificador
    const match = exp.match(/^(\d+)?d(\d+)([+-]\d+)?$/i);

    if (!match) {
      throw new Error("Expressão inválida");
    }

    const count = parseInt(match[1] || "1");
    const sides = parseInt(match[2]);
    const modifier = parseInt(match[3] || "0");

    return { count, sides, modifier };
  } catch (error) {
    return null;
  }
};

// Rolar dados
export const rollDice = (count, sides, modifier = 0) => {
  const rolls = [];
  let total = 0;

  for (let i = 0; i < count; i++) {
    const roll = Math.floor(Math.random() * sides) + 1;
    rolls.push(roll);
    total += roll;
  }

  total += modifier;

  return {
    rolls,
    total,
    modifier,
    isCritical:
      sides === 20 && rolls.length === 1 && (rolls[0] === 1 || rolls[0] === 20),
  };
};

// Rolar com expressão
export const rollExpression = (expression) => {
  const parsed = parseDiceExpression(expression);
  if (!parsed) {
    throw new Error("Expressão inválida");
  }

  return rollDice(parsed.count, parsed.sides, parsed.modifier);
};
