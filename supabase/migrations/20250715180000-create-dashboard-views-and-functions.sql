-- MIGRATION 2: Views e Funções para Dashboard (sem conflitos)
-- Esta migration cria views que combinam dados de tabelas existentes e novas

-- ===============================
-- 1. VIEWS PARA RESUMOS DIÁRIOS
-- ===============================

-- View para resumo diário de hidratação
CREATE OR REPLACE VIEW public.daily_hydration_summary AS
SELECT 
    user_id,
    DATE(logged_at) as log_date,
    SUM(amount_ml) as total_ml,
    COUNT(*) as log_count,
    MIN(logged_at) as first_log,
    MAX(logged_at) as last_log
FROM public.water_intake_logs
GROUP BY user_id, DATE(logged_at)
ORDER BY user_id, log_date DESC;

-- View para resumo semanal de passos
CREATE OR REPLACE VIEW public.weekly_step_summary AS
SELECT 
    user_id,
    DATE_TRUNC('week', recorded_date)::DATE as week_start,
    SUM(step_count) as total_steps,
    AVG(step_count) as avg_daily_steps,
    COUNT(*) as days_recorded,
    MAX(step_count) as max_daily_steps,
    MIN(step_count) as min_daily_steps
FROM public.daily_step_logs
GROUP BY user_id, DATE_TRUNC('week', recorded_date)
ORDER BY user_id, week_start DESC;

-- View para últimos 7 dias de passos
CREATE OR REPLACE VIEW public.recent_step_logs AS
SELECT 
    dsl.user_id,
    dsl.recorded_date,
    dsl.step_count,
    dsl.data_source,
    COALESCE(usg.daily_target_steps, 10000) as daily_target,
    ROUND((dsl.step_count::DECIMAL / COALESCE(usg.daily_target_steps, 10000)) * 100, 1) as completion_percentage
FROM public.daily_step_logs dsl
LEFT JOIN public.user_step_goals usg ON dsl.user_id = usg.user_id
WHERE dsl.recorded_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY dsl.user_id, dsl.recorded_date DESC;

-- View para dashboard de streaks
CREATE OR REPLACE VIEW public.user_streaks_summary AS
SELECT 
    user_id,
    MAX(CASE WHEN streak_type = 'overall' THEN current_count END) as overall_streak,
    MAX(CASE WHEN streak_type = 'daily_login' THEN current_count END) as login_streak,
    MAX(CASE WHEN streak_type = 'workout' THEN current_count END) as workout_streak,
    MAX(CASE WHEN streak_type = 'nutrition' THEN current_count END) as nutrition_streak,
    MAX(CASE WHEN streak_type = 'water' THEN current_count END) as water_streak,
    MAX(CASE WHEN streak_type = 'overall' THEN longest_count END) as best_overall_streak,
    MAX(CASE WHEN streak_type = 'daily_login' THEN longest_count END) as best_login_streak,
    MAX(CASE WHEN streak_type = 'workout' THEN longest_count END) as best_workout_streak
FROM public.user_activity_streaks
GROUP BY user_id;

-- ===============================
-- 2. VIEW CONSOLIDADA PARA DASHBOARD
-- ===============================

-- View principal do dashboard que combina todos os dados
CREATE OR REPLACE VIEW public.dashboard_real_metrics AS
SELECT 
    up.user_id,
    up.weight,
    up.target_weight,
    up.height,
    up.goal,
    up.activity_level,
    
    -- Métricas de hoje
    CURRENT_DATE as today,
    
    -- Hidratação de hoje
    COALESCE(today_water.total_ml, 0) as today_water_ml,
    COALESCE(uhg.daily_target_ml, 2500) as water_target_ml,
    ROUND((COALESCE(today_water.total_ml, 0)::DECIMAL / COALESCE(uhg.daily_target_ml, 2500)) * 100, 1) as water_completion_percentage,
    
    -- Passos de hoje
    COALESCE(today_steps.step_count, 0) as today_steps,
    COALESCE(usg.daily_target_steps, 10000) as steps_target,
    ROUND((COALESCE(today_steps.step_count, 0)::DECIMAL / COALESCE(usg.daily_target_steps, 10000)) * 100, 1) as steps_completion_percentage,
    
    -- Calorias de hoje (usando view meal_nutrition existente se existir)
    COALESCE(today_nutrition.total_calories, 0) as today_calories,
    COALESCE(today_nutrition.total_protein, 0) as today_protein,
    COALESCE(today_nutrition.total_carbs, 0) as today_carbs,
    COALESCE(today_nutrition.total_fats, 0) as today_fats,
    
    -- Refeições registradas hoje (usando tabela meals existente)
    COALESCE(today_meals.meal_count, 0) as today_meals_count,
    
    -- Treinos desta semana (usando tabela workout_logs existente)
    COALESCE(week_workouts.workout_count, 0) as week_workouts_count,
    
    -- Streaks
    COALESCE(uss.overall_streak, 0) as current_streak,
    COALESCE(uss.workout_streak, 0) as workout_streak,
    COALESCE(uss.login_streak, 0) as login_streak,
    COALESCE(uss.nutrition_streak, 0) as nutrition_streak,
    COALESCE(uss.water_streak, 0) as water_streak,
    
    -- Atividade da semana (últimos 7 dias)
    COALESCE(week_activity.active_days, 0) as week_active_days,
    
    -- IMC calculado
    CASE 
        WHEN up.height > 0 AND up.weight > 0 THEN 
            ROUND((up.weight / POWER(up.height / 100.0, 2))::NUMERIC, 1)
        ELSE NULL 
    END as bmi,
    
    -- Categoria do IMC
    CASE 
        WHEN up.height > 0 AND up.weight > 0 THEN
            CASE 
                WHEN (up.weight / POWER(up.height / 100.0, 2)) < 18.5 THEN 'underweight'
                WHEN (up.weight / POWER(up.height / 100.0, 2)) < 25 THEN 'normal'
                WHEN (up.weight / POWER(up.height / 100.0, 2)) < 30 THEN 'overweight'
                ELSE 'obese'
            END
        ELSE 'unknown'
    END as bmi_category,
    
    -- Progresso para meta (%)
    CASE 
        WHEN up.weight > 0 AND up.target_weight > 0 AND up.weight != up.target_weight THEN
            CASE 
                WHEN up.goal = 'lose_weight' THEN
                    GREATEST(0, LEAST(100, 
                        ROUND((((up.weight + 10) - up.weight) / GREATEST(1, (up.weight + 10) - up.target_weight) * 100)::NUMERIC, 0)
                    ))
                WHEN up.goal = 'gain_muscle' THEN  
                    GREATEST(0, LEAST(100, 
                        ROUND(((up.weight - (up.target_weight - 10)) / GREATEST(1, up.target_weight - (up.target_weight - 10)) * 100)::NUMERIC, 0)
                    ))
                ELSE 50
            END
        ELSE 63 -- valor padrão
    END as progress_percentage

FROM public.user_profiles up

-- Hidratação de hoje
LEFT JOIN (
    SELECT 
        user_id,
        SUM(amount_ml) as total_ml
    FROM public.water_intake_logs 
    WHERE DATE(logged_at) = CURRENT_DATE
    GROUP BY user_id
) today_water ON up.user_id = today_water.user_id

-- Meta de hidratação
LEFT JOIN public.user_hydration_goals uhg ON up.user_id = uhg.user_id

-- Passos de hoje
LEFT JOIN public.daily_step_logs today_steps ON up.user_id = today_steps.user_id 
    AND today_steps.recorded_date = CURRENT_DATE

-- Meta de passos
LEFT JOIN public.user_step_goals usg ON up.user_id = usg.user_id

-- Nutrição de hoje (tentativa de usar view meal_nutrition se existir)
LEFT JOIN (
    SELECT 
        user_id,
        SUM(total_calories) as total_calories,
        SUM(total_protein) as total_protein,
        SUM(total_carbs) as total_carbs,
        SUM(total_fats) as total_fats
    FROM (
        -- Fallback case: calcular diretamente se meal_nutrition não existir
        SELECT 
            m.user_id,
            0 as total_calories,
            0 as total_protein, 
            0 as total_carbs,
            0 as total_fats
        FROM public.meals m 
        WHERE DATE(m.created_at) = CURRENT_DATE
        UNION ALL
        -- Caso meal_nutrition exista, usar ela
        SELECT 
            user_id,
            total_calories,
            total_protein,
            total_carbs,
            total_fats
        FROM public.meal_nutrition 
        WHERE meal_date = CURRENT_DATE
    ) combined_nutrition
    GROUP BY user_id
) today_nutrition ON up.user_id = today_nutrition.user_id

-- Contagem de refeições hoje
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(DISTINCT id) as meal_count
    FROM public.meals 
    WHERE DATE(created_at) = CURRENT_DATE
    GROUP BY user_id
) today_meals ON up.user_id = today_meals.user_id

-- Treinos desta semana
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as workout_count
    FROM public.workout_logs 
    WHERE logged_at >= DATE_TRUNC('week', CURRENT_DATE)
        AND logged_at < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
    GROUP BY user_id
) week_workouts ON up.user_id = week_workouts.user_id

-- Streaks
LEFT JOIN public.user_streaks_summary uss ON up.user_id = uss.user_id

-- Dias ativos na semana (com pelo menos 2 atividades)
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as active_days
    FROM public.daily_activity_summary 
    WHERE activity_date >= CURRENT_DATE - INTERVAL '6 days'
        AND activity_date <= CURRENT_DATE
        AND total_activities >= 2
    GROUP BY user_id
) week_activity ON up.user_id = week_activity.user_id;

-- ===============================
-- 3. FUNÇÕES AUXILIARES
-- ===============================

-- Função para registrar atividade diária automaticamente
CREATE OR REPLACE FUNCTION public.log_user_daily_activity(
    p_user_id UUID,
    p_activity_type VARCHAR,
    p_increment INTEGER DEFAULT 1
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.daily_activity_summary (
        user_id, 
        activity_date, 
        logged_in,
        meals_logged,
        workouts_completed,
        water_logged,
        weight_logged
    ) VALUES (
        p_user_id,
        CURRENT_DATE,
        CASE WHEN p_activity_type = 'login' THEN TRUE ELSE FALSE END,
        CASE WHEN p_activity_type = 'meal' THEN p_increment ELSE 0 END,
        CASE WHEN p_activity_type = 'workout' THEN p_increment ELSE 0 END,
        CASE WHEN p_activity_type = 'water' THEN TRUE ELSE FALSE END,
        CASE WHEN p_activity_type = 'weight' THEN TRUE ELSE FALSE END
    )
    ON CONFLICT (user_id, activity_date) DO UPDATE SET
        logged_in = CASE WHEN p_activity_type = 'login' THEN TRUE ELSE daily_activity_summary.logged_in END,
        meals_logged = CASE 
            WHEN p_activity_type = 'meal' THEN daily_activity_summary.meals_logged + p_increment 
            ELSE daily_activity_summary.meals_logged 
        END,
        workouts_completed = CASE 
            WHEN p_activity_type = 'workout' THEN daily_activity_summary.workouts_completed + p_increment 
            ELSE daily_activity_summary.workouts_completed 
        END,
        water_logged = CASE WHEN p_activity_type = 'water' THEN TRUE ELSE daily_activity_summary.water_logged END,
        weight_logged = CASE WHEN p_activity_type = 'weight' THEN TRUE ELSE daily_activity_summary.weight_logged END,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar streaks automaticamente
CREATE OR REPLACE FUNCTION public.update_activity_streaks()
RETURNS TRIGGER AS $$
DECLARE
    user_record RECORD;
    yesterday_date DATE;
BEGIN
    -- Determinar se é INSERT ou UPDATE
    IF TG_OP = 'INSERT' THEN
        user_record := NEW;
    ELSE
        user_record := NEW;
    END IF;

    yesterday_date := user_record.activity_date - INTERVAL '1 day';

    -- Atualizar streak geral (se teve pelo menos 2 atividades no dia)
    IF user_record.total_activities >= 2 THEN
        INSERT INTO public.user_activity_streaks (user_id, streak_type, current_count, longest_count, last_activity_date, streak_start_date)
        VALUES (user_record.user_id, 'overall', 1, 1, user_record.activity_date, user_record.activity_date)
        ON CONFLICT (user_id, streak_type) DO UPDATE SET
            current_count = CASE 
                WHEN user_activity_streaks.last_activity_date = yesterday_date THEN user_activity_streaks.current_count + 1
                WHEN user_activity_streaks.last_activity_date = user_record.activity_date THEN user_activity_streaks.current_count
                ELSE 1
            END,
            longest_count = GREATEST(user_activity_streaks.longest_count, 
                CASE 
                    WHEN user_activity_streaks.last_activity_date = yesterday_date THEN user_activity_streaks.current_count + 1
                    WHEN user_activity_streaks.last_activity_date = user_record.activity_date THEN user_activity_streaks.current_count
                    ELSE 1
                END
            ),
            last_activity_date = user_record.activity_date,
            streak_start_date = CASE
                WHEN user_activity_streaks.last_activity_date = yesterday_date THEN user_activity_streaks.streak_start_date
                ELSE user_record.activity_date
            END,
            updated_at = NOW();
    END IF;

    RETURN user_record;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar streaks quando atividade é registrada
CREATE TRIGGER trigger_update_activity_streaks 
    AFTER INSERT OR UPDATE ON public.daily_activity_summary
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_activity_streaks();

-- ===============================
-- 4. GRANTS E PERMISSÕES
-- ===============================

-- Grants para as views
GRANT SELECT ON public.daily_hydration_summary TO authenticated;
GRANT SELECT ON public.weekly_step_summary TO authenticated;
GRANT SELECT ON public.recent_step_logs TO authenticated;
GRANT SELECT ON public.user_streaks_summary TO authenticated;
GRANT SELECT ON public.dashboard_real_metrics TO authenticated;

-- Grants para a função
GRANT EXECUTE ON FUNCTION public.log_user_daily_activity(UUID, VARCHAR, INTEGER) TO authenticated;
