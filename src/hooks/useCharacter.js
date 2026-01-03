import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export const useCharacter = (characterId) => {
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCharacter = useCallback(async () => {
    if (!characterId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .eq("id", characterId)
        .single();

      if (error) throw error;
      setCharacter(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [characterId]);

  const updateCharacter = async (updates) => {
    try {
      const { data, error } = await supabase
        .from("characters")
        .update(updates)
        .eq("id", characterId)
        .select()
        .single();

      if (error) throw error;
      setCharacter(data);
      return data;
    } catch (err) {
      console.error("Erro ao atualizar personagem:", err);
      throw err;
    }
  };

  const updateAttributes = async (attributes) => {
    return updateCharacter({ attributes });
  };

  const updateResourceBars = async (resource_bars) => {
    return updateCharacter({ resource_bars });
  };

  const updateNotes = async (notes) => {
    return updateCharacter({ notes });
  };

  useEffect(() => {
    fetchCharacter();
  }, [fetchCharacter]);

  return {
    character,
    loading,
    error,
    updateCharacter,
    updateAttributes,
    updateResourceBars,
    updateNotes,
    refetch: fetchCharacter,
  };
};

export const useCharacters = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCharacters = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .order("name");

      if (error) throw error;
      setCharacters(data);
    } catch (err) {
      console.error("Erro ao buscar personagens:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  return { characters, loading, refetch: fetchCharacters };
};
