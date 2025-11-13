import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { validarCodigo, obterUsuario } from "../../utils/users";
import { setAuth, isAuthenticated } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    document.title = "Login - MAG Player";
    if (isAuthenticated()) {
      navigate("/player", { replace: true });
    }
  }, [navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setCarregando(true);
    const codigoUpperCase = codigo.toUpperCase().trim();
    try {
      if (validarCodigo(codigoUpperCase)) {
        const usuario = obterUsuario(codigoUpperCase);
        setAuth(usuario);
        navigate("/player");
      } else {
        setErro("Código incorreto. Verifique e tente novamente.");
        setCodigo("");
        setCarregando(false);
      }
    } catch (err) {
      setErro("Falha ao autenticar. Tente novamente.");
      setCarregando(false);
    }
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
                if (erro) setErro("");
              }}
              required
              disabled={carregando}
              placeholder="Ex: ORC/DDAE-11.25"
            />
          </div>
          <button type="submit" disabled={carregando}>
            {carregando ? "Validando..." : "Entrar"}
          </button>
          <div id="error-message" className="error-message">
            {erro}
          </div>
        </form>
        <div className="info-box">
          <p>🔐 Sistema de Autenticação por Código</p>
          <p style={{ fontSize: "0.85em", color: "#666", marginTop: "8px" }}>
            Digite seu código de acesso institucional
          </p>
        </div>
      </div>
    </div>
  );
}
