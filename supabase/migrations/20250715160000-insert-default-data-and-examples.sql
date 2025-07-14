-- Inserir metas padrão para usuários existentes que não têm metas de hidratação
INSERT INTO user_hydration_goals (user_id, daily_target_ml)
SELECT up.user_id, 2500
FROM user_profiles up
LEFT JOIN user_hydration_goals uhg ON up.user_id = uhg.user_id
WHERE uhg.user_id IS NULL;

-- Inserir metas padrão para usuários existentes que não têm metas de passos
INSERT INTO user_step_goals (user_id, daily_target_steps, weekly_target_steps)
SELECT up.user_id, 10000, 70000
FROM user_profiles up
LEFT JOIN user_step_goals usg ON up.user_id = usg.user_id
WHERE usg.user_id IS NULL;

-- Inserir registro de atividade de login para hoje para usuários ativos
INSERT INTO daily_activity_logs (user_id, activity_date, logged_in)
SELECT DISTINCT up.user_id, CURRENT_DATE, TRUE
FROM user_profiles up
LEFT JOIN daily_activity_logs dal ON up.user_id = dal.user_id AND dal.activity_date = CURRENT_DATE
WHERE dal.user_id IS NULL;

-- Inserir dados de exemplo para demonstração (apenas se não existirem dados reais)

-- Dados de exemplo de hidratação para os últimos 3 dias
INSERT INTO water_logs (user_id, amount_ml, logged_at)
SELECT 
    up.user_id,
    CASE 
        WHEN random() < 0.3 THEN 250
        WHEN random() < 0.6 THEN 500
        ELSE 300
    END,
    (CURRENT_DATE - INTERVAL '2 days') + (INTERVAL '8 hours') + (random() * INTERVAL '12 hours')
FROM user_profiles up
WHERE NOT EXISTS (
    SELECT 1 FROM water_logs wl WHERE wl.user_id = up.user_id AND DATE(wl.logged_at) >= CURRENT_DATE - INTERVAL '2 days'
)
AND random() < 0.8;

-- Mais registros de água para hoje
INSERT INTO water_logs (user_id, amount_ml, logged_at)
SELECT 
    up.user_id,
    250,
    CURRENT_DATE + (INTERVAL '9 hours') + (random() * INTERVAL '8 hours')
FROM user_profiles up
WHERE random() < 0.6;

-- Dados de exemplo de passos para os últimos 7 dias
INSERT INTO daily_steps (user_id, step_count, recorded_date, data_source)
SELECT 
    up.user_id,
    FLOOR(3000 + random() * 12000)::INTEGER,
    CURRENT_DATE - INTERVAL '6 days' + (i || ' days')::INTERVAL,
    'manual'
FROM user_profiles up
CROSS JOIN generate_series(0, 6) as i
WHERE NOT EXISTS (
    SELECT 1 FROM daily_steps ds 
    WHERE ds.user_id = up.user_id 
    AND ds.recorded_date >= CURRENT_DATE - INTERVAL '6 days'
)
AND random() < 0.7;

-- Registrar atividades passadas para gerar streaks
INSERT INTO daily_activity_logs (user_id, activity_date, logged_in, meals_logged, workouts_completed, water_logged)
SELECT 
    up.user_id,
    CURRENT_DATE - INTERVAL '6 days' + (i || ' days')::INTERVAL,
    TRUE,
    FLOOR(1 + random() * 4)::INTEGER,
    CASE WHEN random() < 0.6 THEN FLOOR(1 + random() * 2)::INTEGER ELSE 0 END,
    random() < 0.8
FROM user_profiles up
CROSS JOIN generate_series(0, 6) as i
WHERE NOT EXISTS (
    SELECT 1 FROM daily_activity_logs dal 
    WHERE dal.user_id = up.user_id 
    AND dal.activity_date >= CURRENT_DATE - INTERVAL '6 days'
)
ON CONFLICT (user_id, activity_date) DO NOTHING;

-- Garantir que todos os usuários tenham pelo menos um registro de streak
INSERT INTO user_streaks (user_id, streak_type, current_count, longest_count, last_activity_date, streak_start_date)
SELECT 
    up.user_id,
    'overall',
    FLOOR(1 + random() * 14)::INTEGER,
    FLOOR(1 + random() * 30)::INTEGER,
    CURRENT_DATE,
    CURRENT_DATE - INTERVAL '7 days'
FROM user_profiles up
WHERE NOT EXISTS (
    SELECT 1 FROM user_streaks us WHERE us.user_id = up.user_id AND us.streak_type = 'overall'
);

-- Comentários para documentação
COMMENT ON TABLE water_logs IS 'Registros de consumo de água dos usuários';
COMMENT ON TABLE user_hydration_goals IS 'Metas de hidratação personalizadas por usuário';
COMMENT ON TABLE daily_steps IS 'Registros diários de passos dos usuários';
COMMENT ON TABLE user_step_goals IS 'Metas de passos personalizadas por usuário';
COMMENT ON TABLE user_streaks IS 'Sequências (streaks) de atividades dos usuários';
COMMENT ON TABLE daily_activity_logs IS 'Log de atividades diárias para cálculo de streaks e métricas';
COMMENT ON VIEW dashboard_metrics IS 'View consolidada com todas as métricas do dashboard';

-- Grants para acesso via RPC se necessário
GRANT EXECUTE ON FUNCTION log_daily_activity(UUID, VARCHAR, INTEGER) TO authenticated;
GRANT SELECT ON dashboard_metrics TO authenticated;
GRANT SELECT ON dashboard_streaks TO authenticated;
GRANT SELECT ON daily_water_summary TO authenticated;
GRANT SELECT ON weekly_steps_summary TO authenticated;
GRANT SELECT ON recent_daily_steps TO authenticated;
