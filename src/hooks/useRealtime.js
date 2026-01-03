import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export const useRealtime = (callbacks = {}) => {
  const { onCharacterUpdate, onSessionUpdate, onNewFile, onNewRoll } =
    callbacks;

  useEffect(() => {
    const channels = [];

    // Channel para personagens
    if (onCharacterUpdate) {
      const characterChannel = supabase
        .channel("characters-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "characters" },
          (payload) => {
            console.log("Character update:", payload);
            onCharacterUpdate(payload);
          }
        )
        .subscribe();

      channels.push(characterChannel);
    }

    // Channel para sessão
    if (onSessionUpdate) {
      const sessionChannel = supabase
        .channel("session-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "game_session" },
          (payload) => {
            console.log("Session update:", payload);
            onSessionUpdate(payload);
          }
        )
        .subscribe();

      channels.push(sessionChannel);
    }

    // Channel para arquivos de investigação
    if (onNewFile) {
      const fileChannel = supabase
        .channel("files-changes")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "investigation_files" },
          (payload) => {
            console.log("New file:", payload);
            onNewFile(payload);
          }
        )
        .subscribe();

      channels.push(fileChannel);
    }

    // Channel para rolagens de dados
    if (onNewRoll) {
      const rollChannel = supabase
        .channel("rolls-changes")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "dice_rolls" },
          (payload) => {
            console.log("New roll:", payload);
            onNewRoll(payload);
          }
        )
        .subscribe();

      channels.push(rollChannel);
    }

    // Cleanup
    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [onCharacterUpdate, onSessionUpdate, onNewFile, onNewRoll]);
};

export const useDiceRolls = () => {
  const [rolls, setRolls] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const fetchRolls = React.useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("dice_rolls")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setRolls(data);
    } catch (err) {
      console.error("Erro ao buscar rolagens:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addRoll = async (character, rollData) => {
    try {
      const { data, error } = await supabase
        .from("dice_rolls")
        .insert({
          character_id: character.id,
          character_name: character.name,
          ...rollData,
        })
        .select()
        .single();

      if (error) throw error;
      setRolls([data, ...rolls]);
      return data;
    } catch (err) {
      console.error("Erro ao adicionar rolagem:", err);
      throw err;
    }
  };

  React.useEffect(() => {
    fetchRolls();
  }, [fetchRolls]);

  return { rolls, loading, addRoll, refetch: fetchRolls };
};

// Re-export React for the useDiceRolls hook
import React from "react";
