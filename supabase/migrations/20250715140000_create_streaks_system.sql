-- Criar tabela para tracking de streaks (sequências)
CREATE TABLE IF NOT EXISTS user_streaks (
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
CREATE TABLE IF NOT EXISTS daily_activity_logs (
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_type ON user_streaks(streak_type);
CREATE INDEX IF NOT EXISTS idx_daily_activity_logs_user_id ON daily_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_activity_logs_date ON daily_activity_logs(activity_date);
CREATE INDEX IF NOT EXISTS idx_daily_activity_logs_user_date ON daily_activity_logs(user_id, activity_date);

-- RLS (Row Level Security)
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para user_streaks
CREATE POLICY "Users can view their own streaks" ON user_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" ON user_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" ON user_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas de segurança para daily_activity_logs
CREATE POLICY "Users can view their own activity logs" ON daily_activity_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs" ON daily_activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity logs" ON daily_activity_logs
    FOR UPDATE USING (auth.uid() = user_id);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON user_streaks
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_daily_activity_logs_updated_at BEFORE UPDATE ON daily_activity_logs
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Função para atualizar streaks automaticamente
CREATE OR REPLACE FUNCTION update_user_streaks()
RETURNS TRIGGER AS $$
DECLARE
    user_record RECORD;
    streak_record RECORD;
    yesterday_date DATE;
    streak_broken BOOLEAN;
BEGIN
    -- Determinar se é INSERT ou UPDATE
    IF TG_OP = 'INSERT' THEN
        user_record := NEW;
    ELSE
        user_record := NEW;
    END IF;

    yesterday_date := user_record.activity_date - INTERVAL '1 day';

    -- Atualizar streak de login diário
    IF user_record.logged_in THEN
        INSERT INTO user_streaks (user_id, streak_type, current_count, longest_count, last_activity_date, streak_start_date)
        VALUES (user_record.user_id, 'daily_login', 1, 1, user_record.activity_date, user_record.activity_date)
        ON CONFLICT (user_id, streak_type) DO UPDATE SET
            current_count = CASE 
                WHEN user_streaks.last_activity_date = yesterday_date THEN user_streaks.current_count + 1
                WHEN user_streaks.last_activity_date = user_record.activity_date THEN user_streaks.current_count
                ELSE 1
            END,
            longest_count = GREATEST(user_streaks.longest_count, 
                CASE 
                    WHEN user_streaks.last_activity_date = yesterday_date THEN user_streaks.current_count + 1
                    WHEN user_streaks.last_activity_date = user_record.activity_date THEN user_streaks.current_count
                    ELSE 1
                END
            ),
            last_activity_date = user_record.activity_date,
            streak_start_date = CASE
                WHEN user_streaks.last_activity_date = yesterday_date THEN user_streaks.streak_start_date
                ELSE user_record.activity_date
            END,
            updated_at = NOW();
    END IF;

    -- Atualizar streak de treino
    IF user_record.workouts_completed > 0 THEN
        INSERT INTO user_streaks (user_id, streak_type, current_count, longest_count, last_activity_date, streak_start_date)
        VALUES (user_record.user_id, 'workout', 1, 1, user_record.activity_date, user_record.activity_date)
        ON CONFLICT (user_id, streak_type) DO UPDATE SET
            current_count = CASE 
                WHEN user_streaks.last_activity_date = yesterday_date THEN user_streaks.current_count + 1
                WHEN user_streaks.last_activity_date = user_record.activity_date THEN user_streaks.current_count
                ELSE 1
            END,
            longest_count = GREATEST(user_streaks.longest_count, 
                CASE 
                    WHEN user_streaks.last_activity_date = yesterday_date THEN user_streaks.current_count + 1
                    WHEN user_streaks.last_activity_date = user_record.activity_date THEN user_streaks.current_count
                    ELSE 1
                END
            ),
            last_activity_date = user_record.activity_date,
            streak_start_date = CASE
                WHEN user_streaks.last_activity_date = yesterday_date THEN user_streaks.streak_start_date
                ELSE user_record.activity_date
            END,
            updated_at = NOW();
    END IF;

    -- Atualizar streak geral (se teve pelo menos 2 atividades no dia)
    IF user_record.total_activities >= 2 THEN
        INSERT INTO user_streaks (user_id, streak_type, current_count, longest_count, last_activity_date, streak_start_date)
        VALUES (user_record.user_id, 'overall', 1, 1, user_record.activity_date, user_record.activity_date)
        ON CONFLICT (user_id, streak_type) DO UPDATE SET
            current_count = CASE 
                WHEN user_streaks.last_activity_date = yesterday_date THEN user_streaks.current_count + 1
                WHEN user_streaks.last_activity_date = user_record.activity_date THEN user_streaks.current_count
                ELSE 1
            END,
            longest_count = GREATEST(user_streaks.longest_count, 
                CASE 
                    WHEN user_streaks.last_activity_date = yesterday_date THEN user_streaks.current_count + 1
                    WHEN user_streaks.last_activity_date = user_record.activity_date THEN user_streaks.current_count
                    ELSE 1
                END
            ),
            last_activity_date = user_record.activity_date,
            streak_start_date = CASE
                WHEN user_streaks.last_activity_date = yesterday_date THEN user_streaks.streak_start_date
                ELSE user_record.activity_date
            END,
            updated_at = NOW();
    END IF;

    RETURN user_record;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar streaks quando atividade é registrada
CREATE TRIGGER trigger_update_user_streaks 
    AFTER INSERT OR UPDATE ON daily_activity_logs
    FOR EACH ROW 
    EXECUTE FUNCTION update_user_streaks();

-- View para dashboard de streaks
CREATE OR REPLACE VIEW dashboard_streaks AS
SELECT 
    user_id,
    MAX(CASE WHEN streak_type = 'overall' THEN current_count END) as overall_streak,
    MAX(CASE WHEN streak_type = 'daily_login' THEN current_count END) as login_streak,
    MAX(CASE WHEN streak_type = 'workout' THEN current_count END) as workout_streak,
    MAX(CASE WHEN streak_type = 'overall' THEN longest_count END) as best_overall_streak,
    MAX(CASE WHEN streak_type = 'daily_login' THEN longest_count END) as best_login_streak,
    MAX(CASE WHEN streak_type = 'workout' THEN longest_count END) as best_workout_streak
FROM user_streaks
GROUP BY user_id;
