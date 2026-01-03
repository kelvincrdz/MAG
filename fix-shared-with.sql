-- ========================================
-- Script para adicionar coluna shared_with em investigation_cases
-- ========================================
-- Execute este script no Supabase SQL Editor
-- Dashboard > SQL Editor > Nova Query > Cole e Execute

-- 1. Adicionar a coluna shared_with na tabela investigation_cases
ALTER TABLE investigation_cases 
ADD COLUMN IF NOT EXISTS shared_with TEXT[] DEFAULT ARRAY['all']::TEXT[];

-- 2. Atualizar casos existentes que possam ter NULL (caso a coluna já existisse)
UPDATE investigation_cases 
SET shared_with = ARRAY['all']::TEXT[]
WHERE shared_with IS NULL OR shared_with = '{}';

-- 3. Verificar o resultado dos casos
SELECT 
  id, 
  name, 
  shared_with,
  CASE 
    WHEN shared_with IS NULL THEN '❌ NULL'
    WHEN shared_with = '{}' THEN '❌ VAZIO'
    WHEN 'all' = ANY(shared_with) THEN '✅ Compartilhado com todos'
    ELSE '⚠️ Compartilhado com usuários específicos'
  END as status
FROM investigation_cases
ORDER BY name;

-- 4. Verificar status dos arquivos também
SELECT 
  id, 
  file_name, 
  shared_with,
  CASE 
    WHEN shared_with IS NULL THEN '❌ NULL'
    WHEN shared_with = '{}' THEN '❌ VAZIO'
    WHEN 'all' = ANY(shared_with) THEN '✅ Compartilhado com todos'
    ELSE '⚠️ Compartilhado com usuários específicos'
  END as status
FROM investigation_files
ORDER BY file_name;

