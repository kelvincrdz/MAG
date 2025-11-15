// Utilitários de autenticação para o MAG Player (SPA)

const AUTH_KEY = "magPlayerLogado";
const TIMESTAMP_KEY = "magPlayerTimestamp";
const USER_DATA_KEY = "magPlayerUserData";
const SESSION_DURATION_HOURS = 24;

export function isAuthenticated() {
  if (typeof window === "undefined") return false;
  const logado = localStorage.getItem(AUTH_KEY);
  const timestamp = localStorage.getItem(TIMESTAMP_KEY);
  const userData = localStorage.getItem(USER_DATA_KEY);
  if (logado !== "true" || !timestamp || !userData) return false;
  const agora = Date.now();
  const loginTime = parseInt(timestamp, 10);
  const horasPassadas = (agora - loginTime) / (1000 * 60 * 60);
  if (horasPassadas >= SESSION_DURATION_HOURS) {
    clearAuth();
    return false;
  }
  return true;
}

export function setAuth(userData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY, "true");
  localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(TIMESTAMP_KEY);
  localStorage.removeItem(USER_DATA_KEY);
}

export function getUserData() {
  if (typeof window === "undefined") return null;
  const userData = localStorage.getItem(USER_DATA_KEY);
  if (!userData) return null;
  try {
    return JSON.parse(userData);
  } catch (e) {
    console.error("Erro ao parsear dados do usuário:", e);
    return null;
  }
}

export function updateUserData(newData) {
  if (typeof window === "undefined") return;
  const currentData = getUserData();
  if (!currentData) return;
  const updatedData = { ...currentData, ...newData };
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedData));
}

export function renewSession() {
  if (typeof window === "undefined") return;
  if (isAuthenticated())
    localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
}

export function getSessionTimeLeft() {
  if (typeof window === "undefined") return 0;
  const timestamp = localStorage.getItem(TIMESTAMP_KEY);
  if (!timestamp) return 0;
  const agora = Date.now();
  const loginTime = parseInt(timestamp, 10);
  const horasPassadas = (agora - loginTime) / (1000 * 60 * 60);
  return Math.max(0, SESSION_DURATION_HOURS - horasPassadas);
}

export function getSessionInfo() {
  if (!isAuthenticated()) return null;
  const userData = getUserData();
  const timeLeft = getSessionTimeLeft();
  const timestamp = localStorage.getItem(TIMESTAMP_KEY);
  const start = timestamp ? parseInt(timestamp, 10) : Date.now();
  return {
    usuario: userData,
    horasRestantes: timeLeft.toFixed(1),
    inicioSessao: new Date(start).toLocaleString("pt-BR"),
    expiracao: new Date(start + 24 * 60 * 60 * 1000).toLocaleString("pt-BR"),
  };
}
