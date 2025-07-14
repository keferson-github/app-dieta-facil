-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  muscle_group TEXT NOT NULL,
  exercise_type TEXT CHECK (exercise_type IN ('strength', 'cardio', 'flexibility', 'compound')),
  equipment TEXT,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  instructions TEXT,
  image_url TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create workout_plans table
CREATE TABLE IF NOT EXISTS public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  goal TEXT CHECK (goal IN ('strength', 'endurance', 'weight_loss', 'muscle_gain', 'general_fitness')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create workout_sessions table
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id UUID REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  session_order INTEGER,
  rest_day BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create workout_exercises table
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
  sets INTEGER,
  reps INTEGER,
  weight_kg NUMERIC,
  duration_seconds INTEGER,
  rest_seconds INTEGER,
  notes TEXT,
  exercise_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create workout_logs table
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_session_id UUID REFERENCES public.workout_sessions(id),
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
  sets_completed INTEGER,
  reps_completed INTEGER,
  weight_used NUMERIC,
  duration_seconds INTEGER,
  calories_burned NUMERIC,
  notes TEXT,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- Create body_measurements table
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  weight NUMERIC,
  height NUMERIC,
  body_fat_percentage NUMERIC,
  muscle_mass NUMERIC,
  chest NUMERIC,
  waist NUMERIC,
  hips NUMERIC,
  bicep_left NUMERIC,
  bicep_right NUMERIC,
  thigh_left NUMERIC,
  thigh_right NUMERIC,
  notes TEXT,
  measured_at TIMESTAMPTZ DEFAULT now()
);

-- Create progress_photos table
CREATE TABLE IF NOT EXISTS public.progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type TEXT CHECK (photo_type IN ('front', 'side', 'back', 'before', 'after')),
  description TEXT,
  taken_at TIMESTAMPTZ DEFAULT now()
);

-- Create food_logs table
CREATE TABLE IF NOT EXISTS public.food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id BIGINT REFERENCES public.foods_free(id) ON DELETE CASCADE,
  meal_id UUID REFERENCES public.meals(id),
  quantity_grams NUMERIC NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('cafe_manha', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar', 'ceia')),
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- Create weight_logs table
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  weight NUMERIC NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- Add unique constraint to exercises name if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'exercises_name_unique' 
    AND table_name = 'exercises'
  ) THEN
    ALTER TABLE public.exercises ADD CONSTRAINT exercises_name_unique UNIQUE (name);
  END IF;
END $$;

-- Insert basic exercises
INSERT INTO public.exercises (name, description, muscle_group, exercise_type, equipment, difficulty_level, instructions) VALUES
('Flexão de Braço', 'Exercício clássico para peito, ombros e tríceps', 'Peito', 'strength', 'Nenhum', 2, 'Deite-se de bruços, apoie as mãos no chão na largura dos ombros e empurre o corpo para cima'),
('Agachamento', 'Exercício fundamental para pernas e glúteos', 'Pernas', 'strength', 'Nenhum', 2, 'Fique em pé com os pés na largura dos ombros, desça como se fosse sentar em uma cadeira'),
('Prancha', 'Exercício isométrico para core', 'Core', 'strength', 'Nenhum', 2, 'Fique na posição de flexão, mas apoiado nos antebraços, mantenha o corpo reto'),
('Burpee', 'Exercício completo de alta intensidade', 'Corpo todo', 'compound', 'Nenhum', 4, 'Agachamento, prancha, flexão, pulo com braços para cima'),
('Corrida no Lugar', 'Exercício cardiovascular básico', 'Cardio', 'cardio', 'Nenhum', 1, 'Corra no lugar elevando os joelhos'),
('Abdominais', 'Exercício para músculos abdominais', 'Core', 'strength', 'Nenhum', 2, 'Deite-se de costas, dobre os joelhos e levante o tronco'),
('Polichinelo', 'Exercício cardiovascular de aquecimento', 'Cardio', 'cardio', 'Nenhum', 1, 'Pule abrindo e fechando pernas e braços simultaneamente'),
('Lunges', 'Exercício unilateral para pernas', 'Pernas', 'strength', 'Nenhum', 3, 'Dê um passo grande à frente e desça o joelho traseiro até quase tocar o chão')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS for all tables
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

-- Policies for exercises (public data)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'exercises' 
    AND policyname = 'Anyone can view exercises'
  ) THEN
    CREATE POLICY "Anyone can view exercises" ON public.exercises
    FOR SELECT USING (true);
  END IF;
END $$;

-- Policies for workout_plans
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_plans' 
    AND policyname = 'Users can view own workout plans'
  ) THEN
    CREATE POLICY "Users can view own workout plans" ON public.workout_plans
    FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_plans' 
    AND policyname = 'Users can insert own workout plans'
  ) THEN
    CREATE POLICY "Users can insert own workout plans" ON public.workout_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_plans' 
    AND policyname = 'Users can update own workout plans'
  ) THEN
    CREATE POLICY "Users can update own workout plans" ON public.workout_plans
    FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_plans' 
    AND policyname = 'Users can delete own workout plans'
  ) THEN
    CREATE POLICY "Users can delete own workout plans" ON public.workout_plans
    FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policies for workout_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_sessions' 
    AND policyname = 'Users can view own workout sessions'
  ) THEN
    CREATE POLICY "Users can view own workout sessions" ON public.workout_sessions
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.workout_plans 
        WHERE workout_plans.id = workout_sessions.workout_plan_id 
        AND workout_plans.user_id = auth.uid()
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_sessions' 
    AND policyname = 'Users can insert own workout sessions'
  ) THEN
    CREATE POLICY "Users can insert own workout sessions" ON public.workout_sessions
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.workout_plans 
        WHERE workout_plans.id = workout_sessions.workout_plan_id 
        AND workout_plans.user_id = auth.uid()
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_sessions' 
    AND policyname = 'Users can update own workout sessions'
  ) THEN
    CREATE POLICY "Users can update own workout sessions" ON public.workout_sessions
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.workout_plans 
        WHERE workout_plans.id = workout_sessions.workout_plan_id 
        AND workout_plans.user_id = auth.uid()
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_sessions' 
    AND policyname = 'Users can delete own workout sessions'
  ) THEN
    CREATE POLICY "Users can delete own workout sessions" ON public.workout_sessions
    FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM public.workout_plans 
        WHERE workout_plans.id = workout_sessions.workout_plan_id 
        AND workout_plans.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Policies for workout_exercises
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_exercises' 
    AND policyname = 'Users can view own workout exercises'
  ) THEN
    CREATE POLICY "Users can view own workout exercises" ON public.workout_exercises
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.workout_sessions 
        JOIN public.workout_plans ON workout_plans.id = workout_sessions.workout_plan_id
        WHERE workout_sessions.id = workout_exercises.workout_session_id 
        AND workout_plans.user_id = auth.uid()
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_exercises' 
    AND policyname = 'Users can insert own workout exercises'
  ) THEN
    CREATE POLICY "Users can insert own workout exercises" ON public.workout_exercises
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.workout_sessions 
        JOIN public.workout_plans ON workout_plans.id = workout_sessions.workout_plan_id
        WHERE workout_sessions.id = workout_exercises.workout_session_id 
        AND workout_plans.user_id = auth.uid()
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_exercises' 
    AND policyname = 'Users can update own workout exercises'
  ) THEN
    CREATE POLICY "Users can update own workout exercises" ON public.workout_exercises
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.workout_sessions 
        JOIN public.workout_plans ON workout_plans.id = workout_sessions.workout_plan_id
        WHERE workout_sessions.id = workout_exercises.workout_session_id 
        AND workout_plans.user_id = auth.uid()
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_exercises' 
    AND policyname = 'Users can delete own workout exercises'
  ) THEN
    CREATE POLICY "Users can delete own workout exercises" ON public.workout_exercises
    FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM public.workout_sessions 
        JOIN public.workout_plans ON workout_plans.id = workout_sessions.workout_plan_id
        WHERE workout_sessions.id = workout_exercises.workout_session_id 
        AND workout_plans.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Policies for workout_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_logs' 
    AND policyname = 'Users can view own workout logs'
  ) THEN
    CREATE POLICY "Users can view own workout logs" ON public.workout_logs
    FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_logs' 
    AND policyname = 'Users can insert own workout logs'
  ) THEN
    CREATE POLICY "Users can insert own workout logs" ON public.workout_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_logs' 
    AND policyname = 'Users can update own workout logs'
  ) THEN
    CREATE POLICY "Users can update own workout logs" ON public.workout_logs
    FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_logs' 
    AND policyname = 'Users can delete own workout logs'
  ) THEN
    CREATE POLICY "Users can delete own workout logs" ON public.workout_logs
    FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policies for body_measurements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'body_measurements' 
    AND policyname = 'Users can view own body measurements'
  ) THEN
    CREATE POLICY "Users can view own body measurements" ON public.body_measurements
    FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'body_measurements' 
    AND policyname = 'Users can insert own body measurements'
  ) THEN
    CREATE POLICY "Users can insert own body measurements" ON public.body_measurements
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'body_measurements' 
    AND policyname = 'Users can update own body measurements'
  ) THEN
    CREATE POLICY "Users can update own body measurements" ON public.body_measurements
    FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'body_measurements' 
    AND policyname = 'Users can delete own body measurements'
  ) THEN
    CREATE POLICY "Users can delete own body measurements" ON public.body_measurements
    FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policies for progress_photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'progress_photos' 
    AND policyname = 'Users can view own progress photos'
  ) THEN
    CREATE POLICY "Users can view own progress photos" ON public.progress_photos
    FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'progress_photos' 
    AND policyname = 'Users can insert own progress photos'
  ) THEN
    CREATE POLICY "Users can insert own progress photos" ON public.progress_photos
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'progress_photos' 
    AND policyname = 'Users can update own progress photos'
  ) THEN
    CREATE POLICY "Users can update own progress photos" ON public.progress_photos
    FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'progress_photos' 
    AND policyname = 'Users can delete own progress photos'
  ) THEN
    CREATE POLICY "Users can delete own progress photos" ON public.progress_photos
    FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policies for food_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'food_logs' 
    AND policyname = 'Users can view own food logs'
  ) THEN
    CREATE POLICY "Users can view own food logs" ON public.food_logs
    FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'food_logs' 
    AND policyname = 'Users can insert own food logs'
  ) THEN
    CREATE POLICY "Users can insert own food logs" ON public.food_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'food_logs' 
    AND policyname = 'Users can update own food logs'
  ) THEN
    CREATE POLICY "Users can update own food logs" ON public.food_logs
    FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'food_logs' 
    AND policyname = 'Users can delete own food logs'
  ) THEN
    CREATE POLICY "Users can delete own food logs" ON public.food_logs
    FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policies for weight_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'weight_logs' 
    AND policyname = 'Users can view own weight logs'
  ) THEN
    CREATE POLICY "Users can view own weight logs" ON public.weight_logs
    FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'weight_logs' 
    AND policyname = 'Users can insert own weight logs'
  ) THEN
    CREATE POLICY "Users can insert own weight logs" ON public.weight_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'weight_logs' 
    AND policyname = 'Users can update own weight logs'
  ) THEN
    CREATE POLICY "Users can update own weight logs" ON public.weight_logs
    FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'weight_logs' 
    AND policyname = 'Users can delete own weight logs'
  ) THEN
    CREATE POLICY "Users can delete own weight logs" ON public.weight_logs
    FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create triggers for updated_at columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_workout_plans_updated_at' 
    AND event_object_table = 'workout_plans'
  ) THEN
    CREATE TRIGGER update_workout_plans_updated_at
    BEFORE UPDATE ON public.workout_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Create view for workout session details
CREATE OR REPLACE VIEW public.workout_session_details AS
SELECT 
  ws.id as session_id,
  ws.name as session_name,
  ws.description as session_description,
  ws.session_order,
  wp.user_id,
  wp.name as plan_name,
  COUNT(we.id) as total_exercises,
  SUM(we.sets * we.reps) as total_volume
FROM public.workout_sessions ws
JOIN public.workout_plans wp ON wp.id = ws.workout_plan_id
LEFT JOIN public.workout_exercises we ON we.workout_session_id = ws.id
GROUP BY ws.id, ws.name, ws.description, ws.session_order, wp.user_id, wp.name;
