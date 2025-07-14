-- Criar tabela para registro de passos diários
CREATE TABLE IF NOT EXISTS daily_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    step_count INTEGER NOT NULL CHECK (step_count >= 0),
    recorded_date DATE NOT NULL,
    data_source VARCHAR(50) DEFAULT 'manual', -- manual, fitness_tracker, smartphone, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, recorded_date)
);

-- Criar tabela para metas de passos do usuário
CREATE TABLE IF NOT EXISTS user_step_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    daily_target_steps INTEGER NOT NULL DEFAULT 10000 CHECK (daily_target_steps > 0),
    weekly_target_steps INTEGER NOT NULL DEFAULT 70000 CHECK (weekly_target_steps > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_daily_steps_user_id ON daily_steps(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_steps_recorded_date ON daily_steps(recorded_date);
CREATE INDEX IF NOT EXISTS idx_daily_steps_user_date ON daily_steps(user_id, recorded_date);

-- RLS (Row Level Security)
ALTER TABLE daily_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_step_goals ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para daily_steps
CREATE POLICY "Users can view their own daily steps" ON daily_steps
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily steps" ON daily_steps
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily steps" ON daily_steps
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily steps" ON daily_steps
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas de segurança para user_step_goals
CREATE POLICY "Users can view their own step goals" ON user_step_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own step goals" ON user_step_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own step goals" ON user_step_goals
    FOR UPDATE USING (auth.uid() = user_id);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_daily_steps_updated_at BEFORE UPDATE ON daily_steps
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_step_goals_updated_at BEFORE UPDATE ON user_step_goals
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- View para resumo semanal de passos
CREATE OR REPLACE VIEW weekly_steps_summary AS
SELECT 
    user_id,
    DATE_TRUNC('week', recorded_date)::DATE as week_start,
    SUM(step_count) as total_steps,
    AVG(step_count) as avg_daily_steps,
    COUNT(*) as days_recorded,
    MAX(step_count) as max_daily_steps,
    MIN(step_count) as min_daily_steps
FROM daily_steps
GROUP BY user_id, DATE_TRUNC('week', recorded_date)
ORDER BY user_id, week_start DESC;

-- View para últimos 7 dias de passos
CREATE OR REPLACE VIEW recent_daily_steps AS
SELECT 
    ds.user_id,
    ds.recorded_date,
    ds.step_count,
    ds.data_source,
    COALESCE(usg.daily_target_steps, 10000) as daily_target,
    ROUND((ds.step_count::DECIMAL / COALESCE(usg.daily_target_steps, 10000)) * 100, 1) as completion_percentage
FROM daily_steps ds
LEFT JOIN user_step_goals usg ON ds.user_id = usg.user_id
WHERE ds.recorded_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY ds.user_id, ds.recorded_date DESC;
