import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated, setAuth } from '../utils/auth';

const CODIGO_CORRETO = 'ORC/DDAE-11.25';

export default function IndexPage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Verificar se já está logado
    const checkLogin = () => {
      if (isAuthenticated()) {
        // Sessão ainda válida, redirecionar para player
        router.replace('/player');
      } else {
        setIsChecking(false);
      }
    };
    
    checkLogin();
  }, [router]);

  function onSubmit(e) {
    e.preventDefault();
    if (codigo === CODIGO_CORRETO) {
      // Salvar login com timestamp
      setAuth();
      router.push('/player');
    } else {
      setErro('Código incorreto. Tente novamente.');
      setCodigo('');
    }
  }

  // Mostrar loading enquanto verifica sessão
  if (isChecking) {
    return null;
  }

  return (
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
            />
          </div>
          <button type="submit">Entrar</button>
          <div id="error-message" className="error-message">{erro}</div>
        </form>
      </div>
    </div>
  );
}
