-- Criar tabela para registro de consumo de água
CREATE TABLE IF NOT EXISTS water_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_ml INTEGER NOT NULL CHECK (amount_ml > 0),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para metas de hidratação do usuário
CREATE TABLE IF NOT EXISTS user_hydration_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    daily_target_ml INTEGER NOT NULL DEFAULT 2500 CHECK (daily_target_ml > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_water_logs_user_id ON water_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_water_logs_logged_at ON water_logs(logged_at);
-- Removido índice problemático que usa DATE()

-- RLS (Row Level Security)
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hydration_goals ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para water_logs
CREATE POLICY "Users can view their own water logs" ON water_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own water logs" ON water_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own water logs" ON water_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own water logs" ON water_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas de segurança para user_hydration_goals
CREATE POLICY "Users can view their own hydration goals" ON user_hydration_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hydration goals" ON user_hydration_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hydration goals" ON user_hydration_goals
    FOR UPDATE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_water_logs_updated_at BEFORE UPDATE ON water_logs
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_hydration_goals_updated_at BEFORE UPDATE ON user_hydration_goals
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- View para resumo diário de hidratação
CREATE OR REPLACE VIEW daily_water_summary AS
SELECT 
    user_id,
    DATE(logged_at) as log_date,
    SUM(amount_ml) as total_ml,
    COUNT(*) as log_count,
    MIN(logged_at) as first_log,
    MAX(logged_at) as last_log
FROM water_logs
GROUP BY user_id, DATE(logged_at)
ORDER BY user_id, log_date DESC;
