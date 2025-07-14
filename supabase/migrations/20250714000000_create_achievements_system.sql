-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(10) DEFAULT '🏆',
  points INTEGER DEFAULT 10,
  category VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add points column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'achievements' 
    AND column_name = 'points' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.achievements ADD COLUMN points INTEGER DEFAULT 10;
  END IF;
END $$;

-- Add category column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'achievements' 
    AND column_name = 'category' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.achievements ADD COLUMN category VARCHAR(50) DEFAULT 'general';
  END IF;
END $$;

-- Create user_achievements table (junction table)
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, achievement_id)
);

-- Create user_stats table for tracking progress
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  meals_logged INTEGER DEFAULT 0,
  workouts_completed INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  max_streak_days INTEGER DEFAULT 0,
  weight_logs_count INTEGER DEFAULT 0,
  photos_uploaded INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert basic achievements
INSERT INTO public.achievements (code, title, description, icon, points, category) VALUES
-- Primeira vez
('first_login', 'Primeiro Acesso', 'Bem-vindo ao Dieta Fácil! Você fez seu primeiro login.', '👋', 50, 'milestone'),
('first_meal', 'Primeira Refeição', 'Você registrou sua primeira refeição.', '🍽️', 25, 'nutrition'),
('first_workout', 'Primeiro Treino', 'Você completou seu primeiro treino.', '💪', 25, 'exercise'),
('first_weight_log', 'Primeira Pesagem', 'Você registrou seu primeiro peso.', '⚖️', 25, 'weight'),
('first_photo', 'Primeira Foto', 'Você enviou sua primeira foto de progresso.', '📸', 25, 'progress'),

-- Sequências
('meal_streak_3', 'Constância Nutricional', 'Registre refeições por 3 dias consecutivos.', '🔥', 50, 'streak'),
('meal_streak_7', 'Dedicação Semanal', 'Registre refeições por 7 dias consecutivos.', '⭐', 100, 'streak'),
('meal_streak_30', 'Mestre da Consistência', 'Registre refeições por 30 dias consecutivos.', '👑', 300, 'streak'),
('workout_streak_3', 'Ritmo de Treino', 'Complete treinos por 3 dias consecutivos.', '🏃', 50, 'streak'),
('workout_streak_7', 'Guerreiro Fitness', 'Complete treinos por 7 dias consecutivos.', '⚡', 100, 'streak'),

-- Marcos de quantidade
('meals_10', 'Explorador Culinário', 'Registre 10 refeições diferentes.', '🍕', 75, 'nutrition'),
('meals_50', 'Chef da Dieta', 'Registre 50 refeições.', '👨‍🍳', 150, 'nutrition'),
('meals_100', 'Mestre da Nutrição', 'Registre 100 refeições.', '🏆', 250, 'nutrition'),
('workouts_10', 'Atleta Iniciante', 'Complete 10 treinos.', '🥉', 75, 'exercise'),
('workouts_25', 'Atleta Dedicado', 'Complete 25 treinos.', '🥈', 150, 'exercise'),
('workouts_50', 'Atleta Profissional', 'Complete 50 treinos.', '🥇', 250, 'exercise'),

-- Progresso de peso
('weight_loss_2kg', 'Primeiro Marco', 'Perca 2kg do seu peso inicial.', '📉', 100, 'weight'),
('weight_loss_5kg', 'Transformação Real', 'Perca 5kg do seu peso inicial.', '🎯', 200, 'weight'),
('weight_loss_10kg', 'Conquista Épica', 'Perca 10kg do seu peso inicial.', '🌟', 400, 'weight'),
('weight_goal_achieved', 'Meta Alcançada', 'Alcance seu peso objetivo.', '🎊', 500, 'weight'),

-- Marcos especiais
('perfect_week', 'Semana Perfeita', 'Complete uma semana registrando todas as refeições e treinos.', '✨', 200, 'milestone'),
('early_bird', 'Madrugador', 'Registre um treino antes das 7h da manhã.', '🌅', 50, 'special'),
('night_owl', 'Coruja Fitness', 'Registre um treino após 22h.', '🦉', 50, 'special'),
('weekend_warrior', 'Guerreiro do Fim de Semana', 'Complete treinos no sábado e domingo.', '🏋️', 75, 'special'),
('protein_master', 'Mestre das Proteínas', 'Atinja sua meta de proteínas por 7 dias consecutivos.', '🥩', 150, 'nutrition'),
('hydration_hero', 'Herói da Hidratação', 'Beba 2L de água por 5 dias consecutivos.', '💧', 100, 'health')
ON CONFLICT (code) DO NOTHING;

-- Create RLS policies
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Achievements can be read by anyone
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'achievements' 
    AND policyname = 'Achievements are viewable by everyone'
  ) THEN
    CREATE POLICY "Achievements are viewable by everyone" ON public.achievements
    FOR SELECT USING (true);
  END IF;
END $$;

-- User achievements are only viewable by the user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_achievements' 
    AND policyname = 'Users can view own achievements'
  ) THEN
    CREATE POLICY "Users can view own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_achievements' 
    AND policyname = 'Users can insert own achievements'
  ) THEN
    CREATE POLICY "Users can insert own achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- User stats are only viewable by the user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_stats' 
    AND policyname = 'Users can view own stats'
  ) THEN
    CREATE POLICY "Users can view own stats" ON public.user_stats
    FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_stats' 
    AND policyname = 'Users can update own stats'
  ) THEN
    CREATE POLICY "Users can update own stats" ON public.user_stats
    FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_stats' 
    AND policyname = 'Users can insert own stats'
  ) THEN
    CREATE POLICY "Users can insert own stats" ON public.user_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create function to award achievements
CREATE OR REPLACE FUNCTION public.award_achievement(
  p_user_id UUID,
  p_achievement_code VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_achievement_id UUID;
  v_points INTEGER;
BEGIN
  -- Get achievement ID and points
  SELECT id, points INTO v_achievement_id, v_points
  FROM public.achievements
  WHERE code = p_achievement_code;
  
  IF v_achievement_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user already has this achievement
  IF EXISTS (
    SELECT 1 FROM public.user_achievements
    WHERE user_id = p_user_id AND achievement_id = v_achievement_id
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Award the achievement
  INSERT INTO public.user_achievements (user_id, achievement_id)
  VALUES (p_user_id, v_achievement_id);
  
  -- Update user stats
  INSERT INTO public.user_stats (user_id, total_points)
  VALUES (p_user_id, v_points)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_stats.total_points + v_points,
    current_level = GREATEST(1, (user_stats.total_points + v_points) / 250),
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user stats
CREATE OR REPLACE FUNCTION public.update_user_stats(
  p_user_id UUID,
  p_meals_logged INTEGER DEFAULT NULL,
  p_workouts_completed INTEGER DEFAULT NULL,
  p_streak_days INTEGER DEFAULT NULL,
  p_weight_logs_count INTEGER DEFAULT NULL,
  p_photos_uploaded INTEGER DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_stats (
    user_id,
    meals_logged,
    workouts_completed,
    streak_days,
    weight_logs_count,
    photos_uploaded
  )
  VALUES (
    p_user_id,
    COALESCE(p_meals_logged, 0),
    COALESCE(p_workouts_completed, 0),
    COALESCE(p_streak_days, 0),
    COALESCE(p_weight_logs_count, 0),
    COALESCE(p_photos_uploaded, 0)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    meals_logged = CASE WHEN p_meals_logged IS NOT NULL THEN p_meals_logged ELSE user_stats.meals_logged END,
    workouts_completed = CASE WHEN p_workouts_completed IS NOT NULL THEN p_workouts_completed ELSE user_stats.workouts_completed END,
    streak_days = CASE WHEN p_streak_days IS NOT NULL THEN p_streak_days ELSE user_stats.streak_days END,
    max_streak_days = GREATEST(user_stats.max_streak_days, COALESCE(p_streak_days, user_stats.streak_days)),
    weight_logs_count = CASE WHEN p_weight_logs_count IS NOT NULL THEN p_weight_logs_count ELSE user_stats.weight_logs_count END,
    photos_uploaded = CASE WHEN p_photos_uploaded IS NOT NULL THEN p_photos_uploaded ELSE user_stats.photos_uploaded END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically award achievements

-- Trigger for first login achievement
CREATE OR REPLACE FUNCTION public.award_first_login()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.award_achievement(NEW.user_id, 'first_login');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_award_first_login
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.award_first_login();

-- Trigger for meal achievements
CREATE OR REPLACE FUNCTION public.check_meal_achievements()
RETURNS TRIGGER AS $$
DECLARE
  v_meal_count INTEGER;
BEGIN
  -- Count total meals for user
  SELECT COUNT(*) INTO v_meal_count
  FROM public.meals
  WHERE user_id = NEW.user_id;
  
  -- Award first meal
  IF v_meal_count = 1 THEN
    PERFORM public.award_achievement(NEW.user_id, 'first_meal');
  END IF;
  
  -- Award meal milestones
  IF v_meal_count = 10 THEN
    PERFORM public.award_achievement(NEW.user_id, 'meals_10');
  ELSIF v_meal_count = 50 THEN
    PERFORM public.award_achievement(NEW.user_id, 'meals_50');
  ELSIF v_meal_count = 100 THEN
    PERFORM public.award_achievement(NEW.user_id, 'meals_100');
  END IF;
  
  -- Update user stats
  PERFORM public.update_user_stats(NEW.user_id, p_meals_logged := v_meal_count);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_check_meal_achievements
  AFTER INSERT ON public.meals
  FOR EACH ROW
  EXECUTE FUNCTION public.check_meal_achievements();

-- Trigger for workout achievements
CREATE OR REPLACE FUNCTION public.check_workout_achievements()
RETURNS TRIGGER AS $$
DECLARE
  v_workout_count INTEGER;
BEGIN
  -- Count total workouts for user
  SELECT COUNT(*) INTO v_workout_count
  FROM public.workout_logs
  WHERE user_id = NEW.user_id;
  
  -- Award first workout
  IF v_workout_count = 1 THEN
    PERFORM public.award_achievement(NEW.user_id, 'first_workout');
  END IF;
  
  -- Award workout milestones
  IF v_workout_count = 10 THEN
    PERFORM public.award_achievement(NEW.user_id, 'workouts_10');
  ELSIF v_workout_count = 25 THEN
    PERFORM public.award_achievement(NEW.user_id, 'workouts_25');
  ELSIF v_workout_count = 50 THEN
    PERFORM public.award_achievement(NEW.user_id, 'workouts_50');
  END IF;
  
  -- Update user stats
  PERFORM public.update_user_stats(NEW.user_id, p_workouts_completed := v_workout_count);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_check_workout_achievements
  AFTER INSERT ON public.workout_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.check_workout_achievements();

-- Trigger for weight achievements
CREATE OR REPLACE FUNCTION public.check_weight_achievements()
RETURNS TRIGGER AS $$
DECLARE
  v_weight_count INTEGER;
  v_initial_weight DECIMAL;
  v_current_weight DECIMAL;
  v_target_weight DECIMAL;
  v_weight_lost DECIMAL;
BEGIN
  -- Count total weight logs for user
  SELECT COUNT(*) INTO v_weight_count
  FROM public.weight_logs
  WHERE user_id = NEW.user_id;
  
  -- Award first weight log
  IF v_weight_count = 1 THEN
    PERFORM public.award_achievement(NEW.user_id, 'first_weight_log');
  END IF;
  
  -- Get initial, current, and target weights
  SELECT weight_kg INTO v_initial_weight
  FROM public.weight_logs
  WHERE user_id = NEW.user_id
  ORDER BY logged_at ASC
  LIMIT 1;
  
  v_current_weight := NEW.weight_kg;
  
  SELECT target_weight INTO v_target_weight
  FROM public.user_profiles
  WHERE user_id = NEW.user_id;
  
  -- Calculate weight lost
  v_weight_lost := v_initial_weight - v_current_weight;
  
  -- Award weight loss milestones
  IF v_weight_lost >= 2 THEN
    PERFORM public.award_achievement(NEW.user_id, 'weight_loss_2kg');
  END IF;
  
  IF v_weight_lost >= 5 THEN
    PERFORM public.award_achievement(NEW.user_id, 'weight_loss_5kg');
  END IF;
  
  IF v_weight_lost >= 10 THEN
    PERFORM public.award_achievement(NEW.user_id, 'weight_loss_10kg');
  END IF;
  
  -- Check if goal achieved
  IF v_target_weight IS NOT NULL AND v_current_weight <= v_target_weight THEN
    PERFORM public.award_achievement(NEW.user_id, 'weight_goal_achieved');
  END IF;
  
  -- Update user stats
  PERFORM public.update_user_stats(NEW.user_id, p_weight_logs_count := v_weight_count);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_check_weight_achievements
  AFTER INSERT ON public.weight_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.check_weight_achievements();

-- Trigger for photo achievements
CREATE OR REPLACE FUNCTION public.check_photo_achievements()
RETURNS TRIGGER AS $$
DECLARE
  v_photo_count INTEGER;
BEGIN
  -- Count total photos for user
  SELECT COUNT(*) INTO v_photo_count
  FROM public.progress_photos
  WHERE user_id = NEW.user_id;
  
  -- Award first photo
  IF v_photo_count = 1 THEN
    PERFORM public.award_achievement(NEW.user_id, 'first_photo');
  END IF;
  
  -- Update user stats
  PERFORM public.update_user_stats(NEW.user_id, p_photos_uploaded := v_photo_count);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_check_photo_achievements
  AFTER INSERT ON public.progress_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.check_photo_achievements();
