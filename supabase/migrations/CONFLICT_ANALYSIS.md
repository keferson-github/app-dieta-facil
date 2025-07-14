-- ===============================
-- ANÁLISE DE CONFLITOS DE MIGRATIONS
-- ===============================

/*
TABELAS EXISTENTES NO SISTEMA:
- user_profiles (20250711024701)
- diet_plans, meals, meal_ingredients (20250713120000)
- exercises, workout_plans, workout_sessions, workout_exercises, workout_logs (20250713130000)
- body_measurements, progress_photos, food_logs, weight_logs (20250713130000)
- foods_free (20250713000000)
- bmi_history, activity_stats, progress_timeline, user_goals (20250715000000)

CONFLITOS IDENTIFICADOS NAS MIGRATIONS CRIADAS:

1. TABELAS COM CONFLITOS DE NOMES:
   - Migration 20250715120000: "water_logs" ⚠️ CONFLITO com "food_logs" e "weight_logs" existentes
   - Migration 20250715130000: "daily_steps" ⚠️ Pode confundir com "activity_stats" existente
   - Migration 20250715140000: "daily_activity_logs" ⚠️ Sobrepõe com "activity_stats" existente
   - Migration 20250715150000: "dashboard_metrics" ⚠️ Pode confundir com funcionalidade existente

2. MIGRATIONS COM PROBLEMAS DE REFERÊNCIA:
   - Algumas migrations referenciam tabelas que podem não existir ainda
   - Views criadas fazem referência a tabelas com nomes não padronizados

3. TABELAS QUE NÃO CONFLITAM (SEGURAS):
   ✅ user_hydration_goals (nova funcionalidade)
   ✅ user_step_goals (nova funcionalidade) 
   ✅ user_activity_streaks (nova funcionalidade)
   ✅ user_nutrition_goals (nova funcionalidade)

SOLUÇÃO IMPLEMENTADA NA MIGRATION FINAL:
- Usar nomes únicos: water_intake_logs, daily_step_logs, user_activity_streaks, daily_activity_summary
- Criar view consolidada que integra dados existentes com novos dados
- Manter compatibilidade com sistema existente

MIGRATIONS OBSOLETAS QUE DEVEM SER IGNORADAS:
- 20250715120000-create-water-intake-system.sql
- 20250715130000-create-daily-steps-system.sql  
- 20250715140000-create-streaks-system.sql
- 20250715150000-create-dashboard-metrics-view.sql
- 20250715160000-insert-default-data-and-examples.sql
- 20250715170000-create-dashboard-real-data-no-conflicts.sql
- 20250715180000-create-dashboard-views-and-functions.sql

MIGRATION FINAL LIMPA:
✅ 20250716000000-dashboard-real-data-final.sql (SEM CONFLITOS)

VERIFICAÇÃO FINAL DE CONFLITOS:
1. ✅ Tabela "water_intake_logs" - nome único, sem conflitos
2. ✅ Tabela "daily_step_logs" - nome único, sem conflitos
3. ✅ Tabela "user_activity_streaks" - nome único, sem conflitos
4. ✅ Tabela "daily_activity_summary" - complementa "activity_stats" existente
5. ✅ Tabela "user_hydration_goals" - nova funcionalidade
6. ✅ Tabela "user_step_goals" - nova funcionalidade
7. ✅ Tabela "user_nutrition_goals" - nova funcionalidade
8. ✅ View "dashboard_consolidated_metrics" - integra dados existentes + novos
9. ✅ View "weekly_step_summary" - usa apenas dados novos
10. ✅ Função "update_user_streaks" - nome único
11. ✅ RLS e políticas específicas para tabelas novas
12. ✅ Índices com nomes únicos
13. ✅ Triggers com nomes únicos
14. ✅ View principal usa tanto activity_stats (existente) quanto daily_activity_summary (nova)

INTEGRAÇÃO COM SISTEMA EXISTENTE:
✅ Usa tabelas existentes: user_profiles, meals, diet_plans, workout_logs, activity_stats
✅ Complementa funcionalidades sem sobrescrever
✅ Mantém compatibilidade total com código existente
✅ Adiciona novas funcionalidades de forma incremental

CONCLUSÃO:
✅ A migration final 20250716000000-dashboard-real-data-final.sql está LIMPA e SEM CONFLITOS
✅ Pode ser aplicada com segurança no banco de dados
✅ Integra perfeitamente com o sistema existente
⚠️ As migrations anteriores (20250715*) devem ser IGNORADAS ou REMOVIDAS para evitar conflitos
*/
