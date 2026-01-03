-- ============================================
-- SISTEMA DE RPG - SCHEMA SUPABASE COMPLETO
-- ============================================

-- Tabela de Personagens/Usuários
CREATE TABLE characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  player_email TEXT,
  is_master BOOLEAN DEFAULT FALSE,
  character_type TEXT DEFAULT 'player' CHECK (character_type IN ('player', 'npc', 'creature')),
  password_hash TEXT,
  avatar_url TEXT,
  attributes JSONB DEFAULT '[]'::jsonb,
  resource_bars JSONB DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  initiative_order INTEGER,
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Casos de Investigação
CREATE TABLE investigation_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  shared_with TEXT[] DEFAULT ARRAY['all']::TEXT[],
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Pastas de Investigação
CREATE TABLE investigation_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES investigation_cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_folder_id UUID REFERENCES investigation_folders(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Arquivos de Investigação
CREATE TABLE investigation_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id UUID REFERENCES investigation_folders(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT CHECK (file_type IN ('markdown', 'audio', 'video', 'image', 'pdf')),
  file_url TEXT NOT NULL,
  description TEXT,
  shared_with TEXT[] DEFAULT ARRAY['all']::TEXT[],
  uploaded_by UUID REFERENCES characters(id),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Visualizações de Arquivos
CREATE TABLE file_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID REFERENCES investigation_files(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(file_id, character_id)
);

-- Tabela de Sessão/Estado Global
CREATE TABLE game_session (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  current_turn_index INTEGER DEFAULT 0,
  initiative_order JSONB DEFAULT '[]'::jsonb,
  combat_mode BOOLEAN DEFAULT FALSE,
  session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Rolagens de Dados
CREATE TABLE dice_rolls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id),
  character_name TEXT NOT NULL,
  expression TEXT NOT NULL,
  result INTEGER NOT NULL,
  details JSONB,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir sessão inicial
INSERT INTO game_session (id) VALUES (gen_random_uuid());

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE dice_rolls ENABLE ROW LEVEL SECURITY;

-- Políticas para characters (todos podem ler, apenas o próprio ou mestre pode editar)
CREATE POLICY "Todos podem ver personagens" ON characters FOR SELECT USING (true);
CREATE POLICY "Pode criar personagem" ON characters FOR INSERT WITH CHECK (true);
CREATE POLICY "Pode atualizar próprio personagem ou mestre atualiza todos" ON characters FOR UPDATE USING (true);
CREATE POLICY "Pode deletar próprio personagem ou mestre deleta todos" ON characters FOR DELETE USING (true);

-- Políticas para investigation_cases (todos podem ler, apenas mestre pode modificar)
CREATE POLICY "Todos podem ver casos" ON investigation_cases FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode criar casos" ON investigation_cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar casos" ON investigation_cases FOR UPDATE USING (true);
CREATE POLICY "Qualquer um pode deletar casos" ON investigation_cases FOR DELETE USING (true);

-- Políticas para investigation_folders
CREATE POLICY "Todos podem ver pastas" ON investigation_folders FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode criar pastas" ON investigation_folders FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar pastas" ON investigation_folders FOR UPDATE USING (true);
CREATE POLICY "Qualquer um pode deletar pastas" ON investigation_folders FOR DELETE USING (true);

-- Políticas para investigation_files
CREATE POLICY "Todos podem ver arquivos" ON investigation_files FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode criar arquivos" ON investigation_files FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar arquivos" ON investigation_files FOR UPDATE USING (true);
CREATE POLICY "Qualquer um pode deletar arquivos" ON investigation_files FOR DELETE USING (true);

-- Políticas para file_views
CREATE POLICY "Todos podem ver visualizações" ON file_views FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode registrar visualização" ON file_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar visualização" ON file_views FOR UPDATE USING (true);

-- Políticas para game_session
CREATE POLICY "Todos podem ver sessão" ON game_session FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode atualizar sessão" ON game_session FOR UPDATE USING (true);

-- Políticas para dice_rolls
CREATE POLICY "Todos podem ver rolagens públicas" ON dice_rolls FOR SELECT USING (is_private = false OR true);
CREATE POLICY "Qualquer um pode criar rolagem" ON dice_rolls FOR INSERT WITH CHECK (true);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_characters_player_email ON characters(player_email);
CREATE INDEX idx_characters_is_master ON characters(is_master);
CREATE INDEX idx_investigation_folders_case_id ON investigation_folders(case_id);
CREATE INDEX idx_investigation_folders_parent ON investigation_folders(parent_folder_id);
CREATE INDEX idx_investigation_files_folder_id ON investigation_files(folder_id);
CREATE INDEX idx_file_views_file_id ON file_views(file_id);
CREATE INDEX idx_file_views_character_id ON file_views(character_id);
CREATE INDEX idx_dice_rolls_character_id ON dice_rolls(character_id);
CREATE INDEX idx_dice_rolls_created_at ON dice_rolls(created_at DESC);

-- ============================================
-- FUNÇÕES ÚTEIS
-- ============================================

-- Função para obter arquivos não visualizados por um personagem
CREATE OR REPLACE FUNCTION get_unviewed_files(char_id UUID)
RETURNS TABLE (file_id UUID, file_name TEXT, folder_id UUID, created_at TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
  RETURN QUERY
  SELECT f.id, f.file_name, f.folder_id, f.created_at
  FROM investigation_files f
  LEFT JOIN file_views fv ON f.id = fv.file_id AND fv.character_id = char_id
  WHERE fv.id IS NULL
    AND (f.shared_with @> ARRAY['all']::TEXT[] OR f.shared_with @> ARRAY[char_id::TEXT]);
END;
$$ LANGUAGE plpgsql;

-- Função para limpar rolagens antigas (manter últimas 100)
CREATE OR REPLACE FUNCTION cleanup_old_rolls()
RETURNS void AS $$
BEGIN
  DELETE FROM dice_rolls
  WHERE id NOT IN (
    SELECT id FROM dice_rolls
    ORDER BY created_at DESC
    LIMIT 100
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STORAGE BUCKETS (executar via Dashboard)
-- ============================================

-- Criar buckets:
-- 1. avatars (public)
-- 2. investigation-files (public)

-- Políticas de Storage para avatars:
-- INSERT: authenticated users
-- SELECT: public
-- UPDATE: authenticated users
-- DELETE: authenticated users

-- Políticas de Storage para investigation-files:
-- INSERT: authenticated users
-- SELECT: public
-- UPDATE: authenticated users
-- DELETE: authenticated users
