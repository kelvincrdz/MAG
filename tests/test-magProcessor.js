// Teste simples para saveProcessedMag e getLastProcessedMag
// Executar: npm run test:mag
import {
  saveProcessedMag,
  getLastProcessedMag,
  getProcessedMagHistory,
} from "../utils/magProcessor.js";

// Mock window/localStorage em ambiente Node
if (typeof global.window === "undefined") {
  const store = new Map();
  global.window = {
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, v),
      removeItem: (k) => store.delete(k),
      clear: () => store.clear(),
    },
  };
  global.localStorage = global.window.localStorage;
}

function assert(cond, msg) {
  if (!cond) throw new Error("FALHOU: " + msg);
}

function makeFakeProcessed(i) {
  return {
    success: true,
    magId: i,
    totalFiles: 3,
    audioFiles: [
      {
        fileName: `Audio${i}.mp3`,
        internalPath: `Depoimento/Audio${i}.mp3`,
        size: 1234,
        type: "audio/mpeg",
        role: "attachment",
        associationTag: "outros",
      },
    ],
    markdownFiles: [
      {
        fileName: `Doc${i}.md`,
        internalPath: `Arquivos/Doc${i}.md`,
        title: `Titulo ${i}`,
        references: [],
        associationTag: "arquivos",
      },
    ],
  };
}

// Teste básico
saveProcessedMag(makeFakeProcessed(1));
const last = getLastProcessedMag();
assert(last && last.magId === 1, "lastMagProcessed deve ter magId=1");

// Teste de histórico e trimming
for (let i = 2; i <= 35; i++) {
  saveProcessedMag(makeFakeProcessed(i));
}
const hist = getProcessedMagHistory();
assert(hist.length <= 25, "Histórico deve limitar a 25 entradas");
assert(hist[0].magId === 35, "Último inserido deve estar na frente");
assert(
  hist[hist.length - 1].magId >= 11,
  "Itens antigos além do limite removidos"
);

console.log(
  "✅ Todos os testes de magProcessor passaram. Entradas no histórico:",
  hist.length
);
