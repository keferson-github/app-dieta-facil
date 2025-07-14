-- Create dashboard metrics tables for BMI, Progress, Activity and Goals tracking
-- This migration adds tables to support real data for dashboard cards

-- BMI Tracking Table
-- This table will store historical BMI data for each user
CREATE TABLE IF NOT EXISTS public.bmi_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bmi NUMERIC NOT NULL,
  height_cm NUMERIC NOT NULL,
  weight_kg NUMERIC NOT NULL,
  category TEXT CHECK (category IN ('underweight', 'normal', 'overweight', 'obese')),
  calculated_at TIMESTAMPTZ DEFAULT now()
);

-- Activity Stats Table
-- This table will store detailed activity data per day
CREATE TABLE IF NOT EXISTS public.activity_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week TEXT CHECK (day_of_week IN ('sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat')),
  activity_date DATE NOT NULL,
  workouts_count INTEGER DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,
  steps_count INTEGER DEFAULT 0,
  calories_burned NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Progress Timeline Table
-- This table will store progress milestones and achievements
CREATE TABLE IF NOT EXISTS public.progress_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type TEXT CHECK (milestone_type IN ('weight', 'measurement', 'workout', 'nutrition', 'goal_reached', 'streak')),
  milestone_value NUMERIC,
  description TEXT,
  progress_percentage INTEGER,
  achievement_id UUID REFERENCES public.achievements(id),
  achieved_at TIMESTAMPTZ DEFAULT now()
);

-- User Goals Table
-- This table will store more detailed goals beyond the simple goal in user_profiles
CREATE TABLE IF NOT EXISTS public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT CHECK (goal_type IN ('weight', 'nutrition', 'workout', 'measurement', 'habit')),
  goal_name TEXT NOT NULL,
  goal_description TEXT,
  start_value NUMERIC,
  target_value NUMERIC,
  current_value NUMERIC,
  unit TEXT,
  progress_percentage INTEGER,
  start_date DATE NOT NULL,
  target_date DATE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
-- Add RLS policies for all the new tables

-- BMI History policies
ALTER TABLE public.bmi_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own BMI history"
ON public.bmi_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own BMI history"
ON public.bmi_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own BMI history"
ON public.bmi_history
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Activity Stats policies
ALTER TABLE public.activity_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity stats"
ON public.activity_stats
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity stats"
ON public.activity_stats
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity stats"
ON public.activity_stats
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Progress Timeline policies
ALTER TABLE public.progress_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress timeline"
ON public.progress_timeline
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own progress timeline"
ON public.progress_timeline
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress timeline"
ON public.progress_timeline
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- User Goals policies
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals"
ON public.user_goals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
ON public.user_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.user_goals
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS bmi_history_user_id_idx ON public.bmi_history(user_id);
CREATE INDEX IF NOT EXISTS bmi_history_calculated_at_idx ON public.bmi_history(calculated_at);
CREATE INDEX IF NOT EXISTS activity_stats_user_id_idx ON public.activity_stats(user_id);
CREATE INDEX IF NOT EXISTS activity_stats_date_idx ON public.activity_stats(activity_date);
CREATE INDEX IF NOT EXISTS progress_timeline_user_id_idx ON public.progress_timeline(user_id);
CREATE INDEX IF NOT EXISTS progress_timeline_achieved_at_idx ON public.progress_timeline(achieved_at);
CREATE INDEX IF NOT EXISTS user_goals_user_id_idx ON public.user_goals(user_id);
CREATE INDEX IF NOT EXISTS user_goals_completed_idx ON public.user_goals(completed);

-- Functions for dashboard metrics

-- Function to calculate BMI
CREATE OR REPLACE FUNCTION public.calculate_bmi(weight_kg NUMERIC, height_cm NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  IF height_cm <= 0 OR weight_kg <= 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND(weight_kg / ((height_cm / 100) * (height_cm / 100)), 2);
END;
$$ LANGUAGE plpgsql;

-- Function to get BMI category
CREATE OR REPLACE FUNCTION public.get_bmi_category(bmi NUMERIC)
RETURNS TEXT AS $$
BEGIN
  IF bmi < 18.5 THEN
    RETURN 'underweight';
  ELSIF bmi < 25 THEN
    RETURN 'normal';
  ELSIF bmi < 30 THEN
    RETURN 'overweight';
  ELSE
    RETURN 'obese';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to automatically calculate BMI on insert/update
CREATE OR REPLACE FUNCTION public.set_bmi_category()
RETURNS TRIGGER AS $$
BEGIN
  NEW.bmi := public.calculate_bmi(NEW.weight_kg, NEW.height_cm);
  NEW.category := public.get_bmi_category(NEW.bmi);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for BMI calculation
DROP TRIGGER IF EXISTS set_bmi_category_trigger ON public.bmi_history;
CREATE TRIGGER set_bmi_category_trigger
BEFORE INSERT OR UPDATE ON public.bmi_history
FOR EACH ROW
EXECUTE FUNCTION public.set_bmi_category();

-- Function to calculate progress percentage
CREATE OR REPLACE FUNCTION public.calculate_progress_percentage(
  current_value NUMERIC,
  start_value NUMERIC,
  target_value NUMERIC
)
RETURNS INTEGER AS $$
DECLARE
  progress INTEGER;
BEGIN
  IF start_value = target_value THEN
    RETURN 100;
  END IF;
  
  IF (target_value > start_value) THEN
    -- Goal is to increase (e.g. gain muscle)
    progress := ((current_value - start_value) / (target_value - start_value)) * 100;
  ELSE
    -- Goal is to decrease (e.g. lose weight)
    progress := ((start_value - current_value) / (start_value - target_value)) * 100;
  END IF;
  
  -- Ensure progress is between 0 and 100
  RETURN GREATEST(0, LEAST(100, progress));
END;
$$ LANGUAGE plpgsql;

-- Trigger function to automatically calculate progress percentage for goals
CREATE OR REPLACE FUNCTION public.update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  NEW.progress_percentage := public.calculate_progress_percentage(
    NEW.current_value,
    NEW.start_value,
    NEW.target_value
  );
  
  -- Check if goal has been completed
  IF NEW.progress_percentage >= 100 AND NOT NEW.completed THEN
    NEW.completed := TRUE;
    NEW.completed_at := NOW();
  END IF;
  
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for goal progress calculation
DROP TRIGGER IF EXISTS update_goal_progress_trigger ON public.user_goals;
CREATE TRIGGER update_goal_progress_trigger
BEFORE INSERT OR UPDATE ON public.user_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_goal_progress();

-- Function to get weekly activity summary
CREATE OR REPLACE FUNCTION public.get_weekly_activity_summary(p_user_id UUID)
RETURNS TABLE (
  day_name TEXT,
  workouts INTEGER,
  duration INTEGER,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE activity_stats.day_of_week
      WHEN 'sun' THEN 'Dom'
      WHEN 'mon' THEN 'Seg'
      WHEN 'tue' THEN 'Ter'
      WHEN 'wed' THEN 'Qua'
      WHEN 'thu' THEN 'Qui'
      WHEN 'fri' THEN 'Sex'
      WHEN 'sat' THEN 'Sab'
    END as day_name,
    COALESCE(activity_stats.workouts_count, 0) as workouts,
    COALESCE(activity_stats.total_duration_minutes, 0) as duration,
    COALESCE(activity_stats.is_active, false) as is_active
  FROM (
    SELECT 
      unnest(ARRAY['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']) as day_of_week
  ) days
  LEFT JOIN public.activity_stats ON 
    activity_stats.day_of_week = days.day_of_week 
    AND activity_stats.user_id = p_user_id
    AND activity_stats.activity_date >= CURRENT_DATE - INTERVAL '6 days'
  ORDER BY 
    CASE days.day_of_week
      WHEN 'sun' THEN 0
      WHEN 'mon' THEN 1
      WHEN 'tue' THEN 2
      WHEN 'wed' THEN 3
      WHEN 'thu' THEN 4
      WHEN 'fri' THEN 5
      WHEN 'sat' THEN 6
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update daily activity stats
CREATE OR REPLACE FUNCTION public.update_daily_activity_stats(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE,
  p_workout_duration INTEGER DEFAULT 0,
  p_steps INTEGER DEFAULT 0,
  p_calories NUMERIC DEFAULT 0
)
RETURNS VOID AS $$
DECLARE
  day_name TEXT;
BEGIN
  -- Get day of week
  day_name := CASE EXTRACT(DOW FROM p_date)
    WHEN 0 THEN 'sun'
    WHEN 1 THEN 'mon'
    WHEN 2 THEN 'tue'
    WHEN 3 THEN 'wed'
    WHEN 4 THEN 'thu'
    WHEN 5 THEN 'fri'
    WHEN 6 THEN 'sat'
  END;
  
  -- Insert or update activity stats
  INSERT INTO public.activity_stats (
    user_id,
    day_of_week,
    activity_date,
    workouts_count,
    total_duration_minutes,
    steps_count,
    calories_burned,
    is_active
  )
  VALUES (
    p_user_id,
    day_name,
    p_date,
    CASE WHEN p_workout_duration > 0 THEN 1 ELSE 0 END,
    p_workout_duration,
    p_steps,
    p_calories,
    CASE WHEN p_workout_duration > 0 OR p_steps > 5000 THEN TRUE ELSE FALSE END
  )
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET
    workouts_count = activity_stats.workouts_count + CASE WHEN p_workout_duration > 0 THEN 1 ELSE 0 END,
    total_duration_minutes = activity_stats.total_duration_minutes + p_workout_duration,
    steps_count = GREATEST(activity_stats.steps_count, p_steps),
    calories_burned = activity_stats.calories_burned + p_calories,
    is_active = CASE WHEN (activity_stats.total_duration_minutes + p_workout_duration) > 0 OR GREATEST(activity_stats.steps_count, p_steps) > 5000 THEN TRUE ELSE FALSE END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add unique constraint for activity_stats to prevent duplicates per day
ALTER TABLE public.activity_stats 
ADD CONSTRAINT activity_stats_user_date_unique 
UNIQUE (user_id, activity_date);
