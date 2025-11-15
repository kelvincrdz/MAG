// Sistema de códigos de usuários para o MAG Player
// Cada código identifica um usuário único com suas informações

/**
 * Base de dados de usuários
 * Estrutura: { código: { nome, email, departamento, perfil } }
 */
const USERS_DATABASE = {
  'ORC/DDAE-11.25': {
    id: 'user001',
    nome: 'Magno Oliveira',
    email: 'magno@ifce.edu.br',
    departamento: 'DDAE',
    perfil: 'Professor',
    codigo: 'ORC/DDAE-11.25'
  },
  'ADM/COORD-01.25': {
    id: 'user002',
    nome: 'Maria Silva',
    email: 'maria.silva@ifce.edu.br',
    departamento: 'Coordenação',
    perfil: 'Coordenador',
    codigo: 'ADM/COORD-01.25'
  },
  'TEC/LAB-05.25': {
    id: 'user003',
    nome: 'João Santos',
    email: 'joao.santos@ifce.edu.br',
    departamento: 'Laboratório',
    perfil: 'Técnico',
    codigo: 'TEC/LAB-05.25'
  },
  'EST/INFO-10.25': {
    id: 'user004',
    nome: 'Ana Costa',
    email: 'ana.costa@aluno.ifce.edu.br',
    departamento: 'Informática',
    perfil: 'Estudante',
    codigo: 'EST/INFO-10.25'
  },
  'DOC/BIB-03.25': {
    id: 'user005',
    nome: 'Carlos Mendes',
    email: 'carlos.mendes@ifce.edu.br',
    departamento: 'Biblioteca',
    perfil: 'Bibliotecário',
    codigo: 'DOC/BIB-03.25'
  }
};

/**
 * Valida um código de acesso
 * @param {string} codigo - Código a ser validado
 * @returns {boolean}
 */
export function validarCodigo(codigo) {
  return codigo in USERS_DATABASE;
}

/**
 * Obtém as informações de um usuário pelo código
 * @param {string} codigo - Código do usuário
 * @returns {object|null} Informações do usuário ou null se não encontrado
 */
export function obterUsuario(codigo) {
  return USERS_DATABASE[codigo] || null;
}

/**
 * Obtém todos os códigos válidos (útil para debug/admin)
 * @returns {string[]}
 */
export function listarCodigos() {
  return Object.keys(USERS_DATABASE);
}

/**
 * Busca usuários por departamento
 * @param {string} departamento - Nome do departamento
 * @returns {object[]} Array de usuários do departamento
 */
export function buscarPorDepartamento(departamento) {
  return Object.values(USERS_DATABASE).filter(
    user => user.departamento.toLowerCase() === departamento.toLowerCase()
  );
}

/**
 * Busca usuários por perfil
 * @param {string} perfil - Tipo de perfil (Professor, Estudante, etc.)
 * @returns {object[]} Array de usuários com o perfil
 */
export function buscarPorPerfil(perfil) {
  return Object.values(USERS_DATABASE).filter(
    user => user.perfil.toLowerCase() === perfil.toLowerCase()
  );
}

/**
 * Conta total de usuários cadastrados
 * @returns {number}
 */
export function contarUsuarios() {
  return Object.keys(USERS_DATABASE).length;
}

/**
 * Verifica se um código segue o padrão esperado
 * @param {string} codigo - Código a ser verificado
 * @returns {boolean}
 */
export function validarFormatoCodigo(codigo) {
  // Padrão: XXX/XXX-NN.NN (onde X = letra/número, N = número)
  const pattern = /^[A-Z]{3}\/[A-Z]{3,4}-\d{2}\.\d{2}$/;
  return pattern.test(codigo);
}

/**
 * Obtém estatísticas dos usuários
 * @returns {object} Objeto com estatísticas
 */
export function obterEstatisticas() {
  const usuarios = Object.values(USERS_DATABASE);
  
  const perfis = {};
  const departamentos = {};
  
  usuarios.forEach(user => {
    perfis[user.perfil] = (perfis[user.perfil] || 0) + 1;
    departamentos[user.departamento] = (departamentos[user.departamento] || 0) + 1;
  });
  
  return {
    total: usuarios.length,
    perfis,
    departamentos
  };
}
