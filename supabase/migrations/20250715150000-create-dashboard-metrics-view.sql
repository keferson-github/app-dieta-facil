-- Criar view consolidada para métricas do dashboard
CREATE OR REPLACE VIEW dashboard_metrics AS
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
    
    -- Passos de hoje
    COALESCE(today_steps.step_count, 0) as today_steps,
    COALESCE(usg.daily_target_steps, 10000) as steps_target,
    
    -- Calorias de hoje (da view meal_nutrition existente)
    COALESCE(today_nutrition.total_calories, 0) as today_calories,
    COALESCE(today_nutrition.total_protein, 0) as today_protein,
    COALESCE(today_nutrition.total_carbs, 0) as today_carbs,
    COALESCE(today_nutrition.total_fats, 0) as today_fats,
    
    -- Refeições registradas hoje
    COALESCE(today_meals.meal_count, 0) as today_meals_count,
    
    -- Treinos desta semana
    COALESCE(week_workouts.workout_count, 0) as week_workouts_count,
    
    -- Streaks
    COALESCE(ds.overall_streak, 0) as current_streak,
    COALESCE(ds.workout_streak, 0) as workout_streak,
    COALESCE(ds.login_streak, 0) as login_streak,
    
    -- Atividade da semana (últimos 7 dias)
    COALESCE(week_activity.active_days, 0) as week_active_days,
    
    -- IMC calculado
    CASE 
        WHEN up.height > 0 AND up.weight > 0 THEN 
            ROUND((up.weight / POWER(up.height / 100.0, 2))::NUMERIC, 1)
        ELSE NULL 
    END as bmi,
    
    -- Progresso para meta (%)
    CASE 
        WHEN up.weight > 0 AND up.target_weight > 0 AND up.weight != up.target_weight THEN
            CASE 
                WHEN up.goal = 'lose_weight' THEN
                    GREATEST(0, LEAST(100, ROUND(((up.weight - up.target_weight) / GREATEST(1, ABS(up.weight - up.target_weight))) * 100)::NUMERIC, 0)))
                WHEN up.goal = 'gain_muscle' THEN  
                    GREATEST(0, LEAST(100, ROUND(((up.target_weight - up.weight) / GREATEST(1, ABS(up.target_weight - up.weight))) * 100)::NUMERIC, 0)))
                ELSE 50
            END
        ELSE 0
    END as progress_percentage

FROM user_profiles up

-- Hidratação de hoje
LEFT JOIN (
    SELECT 
        user_id,
        SUM(amount_ml) as total_ml
    FROM water_logs 
    WHERE DATE(logged_at) = CURRENT_DATE
    GROUP BY user_id
) today_water ON up.user_id = today_water.user_id

-- Meta de hidratação
LEFT JOIN user_hydration_goals uhg ON up.user_id = uhg.user_id

-- Passos de hoje
LEFT JOIN daily_steps today_steps ON up.user_id = today_steps.user_id 
    AND today_steps.recorded_date = CURRENT_DATE

-- Meta de passos
LEFT JOIN user_step_goals usg ON up.user_id = usg.user_id

-- Nutrição de hoje (usando view existente)
LEFT JOIN (
    SELECT 
        user_id,
        SUM(total_calories) as total_calories,
        SUM(total_protein) as total_protein,
        SUM(total_carbs) as total_carbs,
        SUM(total_fats) as total_fats
    FROM meal_nutrition 
    WHERE meal_date = CURRENT_DATE
    GROUP BY user_id
) today_nutrition ON up.user_id = today_nutrition.user_id

-- Contagem de refeições hoje
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(DISTINCT id) as meal_count
    FROM meals 
    WHERE DATE(created_at) = CURRENT_DATE
    GROUP BY user_id
) today_meals ON up.user_id = today_meals.user_id

-- Treinos desta semana
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as workout_count
    FROM workout_logs 
    WHERE logged_at >= DATE_TRUNC('week', CURRENT_DATE)
        AND logged_at < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
    GROUP BY user_id
) week_workouts ON up.user_id = week_workouts.user_id

-- Streaks (usando view criada anteriormente)
LEFT JOIN dashboard_streaks ds ON up.user_id = ds.user_id

-- Dias ativos na semana (com pelo menos 2 atividades)
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as active_days
    FROM daily_activity_logs 
    WHERE activity_date >= CURRENT_DATE - INTERVAL '6 days'
        AND activity_date <= CURRENT_DATE
        AND total_activities >= 2
    GROUP BY user_id
) week_activity ON up.user_id = week_activity.user_id;

-- Função para registrar atividade diária automaticamente
CREATE OR REPLACE FUNCTION log_daily_activity(
    p_user_id UUID,
    p_activity_type VARCHAR,
    p_increment INTEGER DEFAULT 1
) RETURNS VOID AS $$
BEGIN
    INSERT INTO daily_activity_logs (
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
        logged_in = CASE WHEN p_activity_type = 'login' THEN TRUE ELSE daily_activity_logs.logged_in END,
        meals_logged = CASE 
            WHEN p_activity_type = 'meal' THEN daily_activity_logs.meals_logged + p_increment 
            ELSE daily_activity_logs.meals_logged 
        END,
        workouts_completed = CASE 
            WHEN p_activity_type = 'workout' THEN daily_activity_logs.workouts_completed + p_increment 
            ELSE daily_activity_logs.workouts_completed 
        END,
        water_logged = CASE WHEN p_activity_type = 'water' THEN TRUE ELSE daily_activity_logs.water_logged END,
        weight_logged = CASE WHEN p_activity_type = 'weight' THEN TRUE ELSE daily_activity_logs.weight_logged END,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para registrar atividades automaticamente

-- Trigger para registrar refeições
CREATE OR REPLACE FUNCTION trigger_log_meal_activity()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_daily_activity(NEW.user_id, 'meal', 1);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER meal_activity_logger 
    AFTER INSERT ON meals
    FOR EACH ROW 
    EXECUTE FUNCTION trigger_log_meal_activity();

-- Trigger para registrar treinos
CREATE OR REPLACE FUNCTION trigger_log_workout_activity()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_daily_activity(NEW.user_id, 'workout', 1);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workout_activity_logger 
    AFTER INSERT ON workout_logs
    FOR EACH ROW 
    EXECUTE FUNCTION trigger_log_workout_activity();

-- Trigger para registrar consumo de água
CREATE OR REPLACE FUNCTION trigger_log_water_activity()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_daily_activity(NEW.user_id, 'water', 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER water_activity_logger 
    AFTER INSERT ON water_logs
    FOR EACH ROW 
    EXECUTE FUNCTION trigger_log_water_activity();

-- Trigger para registrar peso
CREATE OR REPLACE FUNCTION trigger_log_weight_activity()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_daily_activity(NEW.user_id, 'weight', 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER weight_activity_logger 
    AFTER INSERT ON weight_logs
    FOR EACH ROW 
    EXECUTE FUNCTION trigger_log_weight_activity();
