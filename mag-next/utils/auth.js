// Utilitários de autenticação para o MAG Player

const AUTH_KEY = 'magPlayerLogado';
const TIMESTAMP_KEY = 'magPlayerTimestamp';
const USER_DATA_KEY = 'magPlayerUserData';
const SESSION_DURATION_HOURS = 24;

/**
 * Verifica se o usuário está autenticado e se a sessão ainda é válida
 * @returns {boolean}
 */
export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  
  const logado = localStorage.getItem(AUTH_KEY);
  const timestamp = localStorage.getItem(TIMESTAMP_KEY);
  const userData = localStorage.getItem(USER_DATA_KEY);
  
  if (logado !== 'true' || !timestamp || !userData) {
    return false;
  }
  
  const agora = new Date().getTime();
  const loginTime = parseInt(timestamp);
  const horasPassadas = (agora - loginTime) / (1000 * 60 * 60);
  
  if (horasPassadas >= SESSION_DURATION_HOURS) {
    // Sessão expirada
    clearAuth();
    return false;
  }
  
  return true;
}

/**
 * Realiza o login do usuário
 * @param {object} userData - Dados do usuário a serem armazenados
 */
export function setAuth(userData) {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(AUTH_KEY, 'true');
  localStorage.setItem(TIMESTAMP_KEY, new Date().getTime().toString());
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
}

/**
 * Realiza o logout do usuário
 */
export function clearAuth() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(TIMESTAMP_KEY);
  localStorage.removeItem(USER_DATA_KEY);
}

/**
 * Obtém os dados do usuário logado
 * @returns {object|null} Dados do usuário ou null se não estiver logado
 */
export function getUserData() {
  if (typeof window === 'undefined') return null;
  
  const userData = localStorage.getItem(USER_DATA_KEY);
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Erro ao parsear dados do usuário:', error);
    return null;
  }
}

/**
 * Atualiza os dados do usuário logado
 * @param {object} newData - Novos dados do usuário
 */
export function updateUserData(newData) {
  if (typeof window === 'undefined') return;
  
  const currentData = getUserData();
  if (!currentData) return;
  
  const updatedData = { ...currentData, ...newData };
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedData));
}

/**
 * Renova o timestamp da sessão (útil para atividade do usuário)
 */
export function renewSession() {
  if (typeof window === 'undefined') return;
  
  if (isAuthenticated()) {
    localStorage.setItem(TIMESTAMP_KEY, new Date().getTime().toString());
  }
}

/**
 * Obtém o tempo restante da sessão em horas
 * @returns {number}
 */
export function getSessionTimeLeft() {
  if (typeof window === 'undefined') return 0;
  
  const timestamp = localStorage.getItem(TIMESTAMP_KEY);
  if (!timestamp) return 0;
  
  const agora = new Date().getTime();
  const loginTime = parseInt(timestamp);
  const horasPassadas = (agora - loginTime) / (1000 * 60 * 60);
  
  return Math.max(0, SESSION_DURATION_HOURS - horasPassadas);
}

/**
 * Obtém informações formatadas da sessão
 * @returns {object} Objeto com informações da sessão
 */
export function getSessionInfo() {
  if (!isAuthenticated()) return null;
  
  const userData = getUserData();
  const timeLeft = getSessionTimeLeft();
  const timestamp = localStorage.getItem(TIMESTAMP_KEY);
  
  return {
    usuario: userData,
    horasRestantes: timeLeft.toFixed(1),
    inicioSessao: new Date(parseInt(timestamp)).toLocaleString('pt-BR'),
    expiracao: new Date(parseInt(timestamp) + SESSION_DURATION_HOURS * 60 * 60 * 1000).toLocaleString('pt-BR')
  };
}
