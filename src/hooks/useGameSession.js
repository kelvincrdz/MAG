import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export const useGameSession = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("game_session")
        .select("*")
        .limit(1)
        .single();

      if (error) throw error;
      setSession(data);
    } catch (err) {
      console.error("Erro ao buscar sessão:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSession = async (updates) => {
    try {
      const { data, error } = await supabase
        .from("game_session")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", session.id)
        .select()
        .single();

      if (error) throw error;
      setSession(data);
      return data;
    } catch (err) {
      console.error("Erro ao atualizar sessão:", err);
      throw err;
    }
  };

  const nextTurn = async () => {
    const newIndex =
      (session.current_turn_index + 1) %
      (session.initiative_order?.length || 1);
    return updateSession({ current_turn_index: newIndex });
  };

  const previousTurn = async () => {
    const newIndex =
      session.current_turn_index - 1 < 0
        ? (session.initiative_order?.length || 1) - 1
        : session.current_turn_index - 1;
    return updateSession({ current_turn_index: newIndex });
  };

  const resetTurn = async () => {
    return updateSession({ current_turn_index: 0 });
  };

  const skipTurn = async () => {
    return nextTurn();
  };

  const reorderInitiative = async (newOrder) => {
    return updateSession({
      initiative_order: newOrder.map((char) => char.id),
      current_turn_index: 0,
    });
  };

  const toggleCombatMode = async () => {
    return updateSession({ combat_mode: !session.combat_mode });
  };

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return {
    session,
    loading,
    updateSession,
    nextTurn,
    previousTurn,
    resetTurn,
    skipTurn,
    reorderInitiative,
    toggleCombatMode,
    refetch: fetchSession,
  };
};
