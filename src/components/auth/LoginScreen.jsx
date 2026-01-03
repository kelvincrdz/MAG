import React, { useState, useEffect } from "react";
import { User, Lock, LogIn } from "lucide-react";
import Button from "../common/Button";
import Input from "../common/Input";
import { supabase, hashPassword, verifyPassword } from "../../lib/supabase";

const LoginScreen = ({ onLogin }) => {
  const [isMaster, setIsMaster] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Carregar lista de personagens ao montar o componente
  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const { data, error } = await supabase
        .from("characters")
        .select("id, name")
        .eq("is_master", false)
        .order("name");

      if (error) throw error;
      setCharacters(data || []);
    } catch (err) {
      console.error("Erro ao carregar personagens:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isMaster) {
        // Login do mestre
        if (!password) {
          throw new Error("Senha é obrigatória para o mestre");
        }

        const { data: master, error: masterError } = await supabase
          .from("characters")
          .select("*")
          .eq("is_master", true)
          .single();

        if (masterError && masterError.code !== "PGRST116") {
          throw masterError;
        }

        if (master) {
          // Verificar senha
          const isValid = verifyPassword(password, master.password_hash);
          if (!isValid) {
            throw new Error("Senha incorreta");
          }

          // Atualizar último login
          await supabase
            .from("characters")
            .update({ last_login: new Date().toISOString() })
            .eq("id", master.id);

          onLogin(master);
        } else {
          throw new Error(
            "Nenhum mestre cadastrado. Crie um personagem mestre primeiro."
          );
        }
      } else {
        // Login do jogador
        if (!selectedCharacter) {
          throw new Error("Selecione um personagem");
        }

        const { data: character, error: charError } = await supabase
          .from("characters")
          .select("*")
          .eq("id", selectedCharacter)
          .single();

        if (charError) throw charError;

        // Atualizar último login
        await supabase
          .from("characters")
          .update({ last_login: new Date().toISOString() })
          .eq("id", character.id);

        onLogin(character);
      }
    } catch (err) {
      console.error("Erro no login:", err);
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-secondary via-background to-secondary">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-primary mb-2">Sistema RPG</h1>
          <p className="text-textMuted">Faça login para continuar</p>
        </div>

        {/* Login Card */}
        <div className="bg-surface border border-border rounded-lg shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Tipo de Usuário */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-text mb-3">
                Tipo de Usuário
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsMaster(false)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    !isMaster
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface text-textMuted hover:border-border/50"
                  }`}
                >
                  <User className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Jogador</div>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMaster(true)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isMaster
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface text-textMuted hover:border-border/50"
                  }`}
                >
                  <Lock className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Mestre</div>
                </button>
              </div>
            </div>
            {/* Campo para Jogador: Dropdown de Personagens */}
            {!isMaster && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text">
                  Selecione seu Personagem
                </label>
                <select
                  value={selectedCharacter}
                  onChange={(e) => setSelectedCharacter(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">Escolha um personagem...</option>
                  {characters.map((char) => (
                    <option key={char.id} value={char.id}>
                      {char.name}
                    </option>
                  ))}
                </select>
                {characters.length === 0 && (
                  <p className="text-sm text-textMuted mt-2">
                    Nenhum personagem disponível. Peça ao mestre para criar
                    personagens.
                  </p>
                )}
              </div>
            )}
            {/* Campo para Mestre: Senha */}
            {isMaster && (
              <Input
                label="Senha do Mestre"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha do mestre"
                required
              />
            )}
            {/* Erro */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}
            {/* Botão Login */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading || (!isMaster && !selectedCharacter)}
              icon={loading ? null : <LogIn size={20} />}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 text-center text-textDim text-sm">
            {isMaster ? (
              <p>Digite a senha do mestre para acesso completo.</p>
            ) : (
              <p>Selecione seu personagem para entrar na sessão.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
