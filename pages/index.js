import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { validarCodigo, obterUsuario } from '../utils/users';
import { setAuth, isAuthenticated } from '../mag-next/utils/auth';
import { apiFetch, setAuthToken } from '../utils/api';

export default function IndexPage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isAuthenticated()) {
        router.replace('/player');
      }
    }
  }, [router]);

  async function onSubmit(e) {
    e.preventDefault();
    setCarregando(true);
    const codigoUpperCase = codigo.toUpperCase().trim();
    try {
      // Primeiro tenta validar via backend
      const loginResp = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigoUpperCase })
      });
      // Guarda token e dados de usuário no mesmo mecanismo atual (para não quebrar UI)
      setAuthToken(loginResp.access_token);
      setAuth(loginResp.user);
      router.push('/player');
    } catch (err) {
      // Fallback: lógica local antiga
      if (validarCodigo(codigoUpperCase)) {
        const usuario = obterUsuario(codigoUpperCase);
        setAuth(usuario);
        router.push('/player');
      } else {
        setErro(err.message || 'Código incorreto. Verifique e tente novamente.');
        setCodigo('');
        setCarregando(false);
      }
    }
  }

  return (
    <>
      <Head>
        <title>Login - MAG Player</title>
      </Head>
      <div className="login-container">
        <div className="login-box">
          <h1>IFCE MAGNO</h1>
          <form onSubmit={onSubmit} id="loginForm">
            <div className="input-group">
              <label htmlFor="codigo">Código de Acesso:</label>
              <input
                type="password"
                id="codigo"
                name="codigo"
                value={codigo}
                onChange={(e) => {
                  setCodigo(e.target.value);
                  if (erro) setErro('');
                }}
                required
                disabled={carregando}
                placeholder="Ex: ORC/DDAE-11.25"
              />
            </div>
            <button type="submit" disabled={carregando}>
              {carregando ? 'Validando...' : 'Entrar'}
            </button>
            <div id="error-message" className="error-message">{erro}</div>
          </form>
          <div className="info-box">
            <p>🔐 Sistema de Autenticação por Código</p>
            <p style={{ fontSize: '0.85em', color: '#666', marginTop: '8px' }}>
              Digite seu código de acesso institucional
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
