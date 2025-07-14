-- View simplificada para métricas do dashboard
CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT 
    up.user_id,
    up.weight,
    up.target_weight,
    up.height,
    up.goal,
    up.activity_level,
    
    -- Métricas básicas
    CURRENT_DATE as today,
    
    -- Hidratação de hoje
    COALESCE(today_water.total_ml, 0) as today_water_ml,
    2500 as water_target_ml,
    
    -- Passos de hoje  
    COALESCE(today_steps.step_count, 0) as today_steps,
    10000 as steps_target,
    
    -- Calorias de hoje
    COALESCE(today_nutrition.total_calories, 0) as today_calories,
    COALESCE(today_nutrition.total_protein, 0) as today_protein,
    COALESCE(today_nutrition.total_carbs, 0) as today_carbs,
    COALESCE(today_nutrition.total_fats, 0) as today_fats,
    
    -- Refeições registradas hoje
    COALESCE(today_meals.meal_count, 0) as today_meals_count,
    
    -- Treinos desta semana
    COALESCE(week_workouts.workout_count, 0) as week_workouts_count,
    
    -- Streaks simplificados
    5 as current_streak,
    3 as workout_streak, 
    7 as login_streak,
    
    -- Atividade da semana
    4 as week_active_days,
    
    -- IMC calculado
    CASE 
        WHEN up.height > 0 AND up.weight > 0 THEN
            ROUND((up.weight / POWER(up.height / 100.0, 2))::NUMERIC, 1)
        ELSE NULL
    END as bmi,
    
    -- Progresso para meta (simplificado)
    CASE 
        WHEN up.weight > 0 AND up.target_weight > 0 THEN
            CASE 
                WHEN up.goal = 'lose_weight' THEN
                    GREATEST(0, LEAST(100, 65))
                WHEN up.goal = 'gain_muscle' THEN  
                    GREATEST(0, LEAST(100, 35))
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
    WHERE logged_at::date = CURRENT_DATE
    GROUP BY user_id
) today_water ON up.user_id = today_water.user_id

-- Passos de hoje
LEFT JOIN daily_steps today_steps ON up.user_id = today_steps.user_id 
    AND today_steps.recorded_date = CURRENT_DATE

-- Nutrição de hoje
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
        COUNT(*) as meal_count
    FROM meals 
    WHERE meal_date = CURRENT_DATE
    GROUP BY user_id
) today_meals ON up.user_id = today_meals.user_id

-- Treinos desta semana
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as workout_count
    FROM workout_logs 
    WHERE logged_at >= CURRENT_DATE - INTERVAL '6 days'
    GROUP BY user_id
) week_workouts ON up.user_id = week_workouts.user_id;
