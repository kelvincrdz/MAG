// Utilitários de autenticação para o MAG Player

const AUTH_KEY = 'magPlayerLogado';
const TIMESTAMP_KEY = 'magPlayerTimestamp';
const SESSION_DURATION_HOURS = 24;

/**
 * Verifica se o usuário está autenticado e se a sessão ainda é válida
 * @returns {boolean}
 */
export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  
  const logado = localStorage.getItem(AUTH_KEY);
  const timestamp = localStorage.getItem(TIMESTAMP_KEY);
  
  if (logado !== 'true' || !timestamp) {
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
 */
export function setAuth() {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(AUTH_KEY, 'true');
  localStorage.setItem(TIMESTAMP_KEY, new Date().getTime().toString());
}

/**
 * Realiza o logout do usuário
 */
export function clearAuth() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(TIMESTAMP_KEY);
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
