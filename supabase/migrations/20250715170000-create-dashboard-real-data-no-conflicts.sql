-- MIGRATION CORRIGIDA - Evita conflitos com tabelas existentes
-- Esta migration cria apenas as novas tabelas necessárias para dados reais do dashboard

-- ===============================
-- 1. SISTEMA DE HIDRATAÇÃO
-- ===============================

-- Criar tabela para registro de consumo de água
CREATE TABLE IF NOT EXISTS public.water_intake_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_ml INTEGER NOT NULL CHECK (amount_ml > 0),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para metas de hidratação do usuário
CREATE TABLE IF NOT EXISTS public.user_hydration_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    daily_target_ml INTEGER NOT NULL DEFAULT 2500 CHECK (daily_target_ml > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ===============================
-- 2. SISTEMA DE PASSOS DIÁRIOS
-- ===============================

-- Criar tabela para registro de passos diários
CREATE TABLE IF NOT EXISTS public.daily_step_logs (
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
CREATE TABLE IF NOT EXISTS public.user_step_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    daily_target_steps INTEGER NOT NULL DEFAULT 10000 CHECK (daily_target_steps > 0),
    weekly_target_steps INTEGER NOT NULL DEFAULT 70000 CHECK (weekly_target_steps > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ===============================
-- 3. SISTEMA DE STREAKS E ATIVIDADES
-- ===============================

-- Criar tabela para tracking de streaks (sequências)
CREATE TABLE IF NOT EXISTS public.user_activity_streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    streak_type VARCHAR(50) NOT NULL, -- 'daily_login', 'workout', 'nutrition', 'water', 'overall'
    current_count INTEGER NOT NULL DEFAULT 0 CHECK (current_count >= 0),
    longest_count INTEGER NOT NULL DEFAULT 0 CHECK (longest_count >= 0),
    last_activity_date DATE,
    streak_start_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, streak_type)
);

-- Criar tabela para log de atividades diárias (para calcular streaks)
CREATE TABLE IF NOT EXISTS public.daily_activity_summary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    logged_in BOOLEAN DEFAULT FALSE,
    meals_logged INTEGER DEFAULT 0 CHECK (meals_logged >= 0),
    workouts_completed INTEGER DEFAULT 0 CHECK (workouts_completed >= 0),
    water_logged BOOLEAN DEFAULT FALSE,
    weight_logged BOOLEAN DEFAULT FALSE,
    total_activities INTEGER GENERATED ALWAYS AS (
        CASE WHEN logged_in THEN 1 ELSE 0 END +
        CASE WHEN meals_logged > 0 THEN 1 ELSE 0 END +
        CASE WHEN workouts_completed > 0 THEN 1 ELSE 0 END +
        CASE WHEN water_logged THEN 1 ELSE 0 END +
        CASE WHEN weight_logged THEN 1 ELSE 0 END
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, activity_date)
);

-- ===============================
-- 4. ÍNDICES PARA PERFORMANCE
-- ===============================

-- Índices para water_intake_logs
CREATE INDEX IF NOT EXISTS idx_water_intake_logs_user_id ON public.water_intake_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_water_intake_logs_logged_at ON public.water_intake_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_water_intake_logs_user_date ON public.water_intake_logs(user_id, DATE(logged_at));

-- Índices para daily_step_logs
CREATE INDEX IF NOT EXISTS idx_daily_step_logs_user_id ON public.daily_step_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_step_logs_recorded_date ON public.daily_step_logs(recorded_date);
CREATE INDEX IF NOT EXISTS idx_daily_step_logs_user_date ON public.daily_step_logs(user_id, recorded_date);

-- Índices para user_activity_streaks
CREATE INDEX IF NOT EXISTS idx_user_activity_streaks_user_id ON public.user_activity_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_streaks_type ON public.user_activity_streaks(streak_type);

-- Índices para daily_activity_summary
CREATE INDEX IF NOT EXISTS idx_daily_activity_summary_user_id ON public.daily_activity_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_activity_summary_date ON public.daily_activity_summary(activity_date);
CREATE INDEX IF NOT EXISTS idx_daily_activity_summary_user_date ON public.daily_activity_summary(user_id, activity_date);

-- ===============================
-- 5. RLS (ROW LEVEL SECURITY)
-- ===============================

-- Habilitar RLS em todas as novas tabelas
ALTER TABLE public.water_intake_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_hydration_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_step_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_step_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity_summary ENABLE ROW LEVEL SECURITY;

-- ===============================
-- 6. POLÍTICAS DE SEGURANÇA
-- ===============================

-- Políticas para water_intake_logs
CREATE POLICY "Users can view their own water logs" ON public.water_intake_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own water logs" ON public.water_intake_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own water logs" ON public.water_intake_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own water logs" ON public.water_intake_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para user_hydration_goals
CREATE POLICY "Users can view their own hydration goals" ON public.user_hydration_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hydration goals" ON public.user_hydration_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hydration goals" ON public.user_hydration_goals
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para daily_step_logs
CREATE POLICY "Users can view their own step logs" ON public.daily_step_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own step logs" ON public.daily_step_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own step logs" ON public.daily_step_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own step logs" ON public.daily_step_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para user_step_goals
CREATE POLICY "Users can view their own step goals" ON public.user_step_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own step goals" ON public.user_step_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own step goals" ON public.user_step_goals
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para user_activity_streaks
CREATE POLICY "Users can view their own streaks" ON public.user_activity_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" ON public.user_activity_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" ON public.user_activity_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para daily_activity_summary
CREATE POLICY "Users can view their own activity summary" ON public.daily_activity_summary
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity summary" ON public.daily_activity_summary
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity summary" ON public.daily_activity_summary
    FOR UPDATE USING (auth.uid() = user_id);

-- ===============================
-- 7. TRIGGERS PARA UPDATED_AT
-- ===============================

-- Função para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER trigger_water_intake_logs_updated_at 
    BEFORE UPDATE ON public.water_intake_logs
    FOR EACH ROW 
    EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER trigger_user_hydration_goals_updated_at 
    BEFORE UPDATE ON public.user_hydration_goals
    FOR EACH ROW 
    EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER trigger_daily_step_logs_updated_at 
    BEFORE UPDATE ON public.daily_step_logs
    FOR EACH ROW 
    EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER trigger_user_step_goals_updated_at 
    BEFORE UPDATE ON public.user_step_goals
    FOR EACH ROW 
    EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER trigger_user_activity_streaks_updated_at 
    BEFORE UPDATE ON public.user_activity_streaks
    FOR EACH ROW 
    EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER trigger_daily_activity_summary_updated_at 
    BEFORE UPDATE ON public.daily_activity_summary
    FOR EACH ROW 
    EXECUTE PROCEDURE public.handle_updated_at();
