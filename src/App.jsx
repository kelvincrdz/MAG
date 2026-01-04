import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import LoginScreen from "./components/auth/LoginScreen";
import MasterDashboard from "./pages/MasterView";
import PlayerDashboard from "./pages/PlayerView";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const savedUser = localStorage.getItem("rpg_current_user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Erro ao recuperar sessão:", error);
        localStorage.removeItem("rpg_current_user");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem("rpg_current_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("rpg_current_user");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1f2e",
              color: "#f8f9fa",
              border: "1px solid #334155",
            },
          }}
        />
      </>
    );
  }

  return (
    <>
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-40 px-4 py-2 bg-surface hover:bg-surfaceHover border border-border rounded-lg text-textMuted hover:text-text transition-colors text-sm"
      >
        Sair
      </button>

      {/* Main Dashboard */}
      {currentUser.is_master ? (
        <MasterDashboard character={currentUser} />
      ) : (
        <PlayerDashboard character={currentUser} />
      )}

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1a1f2e",
            color: "#f8f9fa",
            border: "1px solid #334155",
          },
          success: {
            iconTheme: {
              primary: "#2c3638",
              secondary: "#f8f9fa",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#f8f9fa",
            },
          },
        }}
      />
    </>
  );
}

export default App;
