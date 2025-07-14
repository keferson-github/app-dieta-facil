-- Create diet_plans table
CREATE TABLE IF NOT EXISTS public.diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create meals table
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_plan_id UUID REFERENCES public.diet_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('cafe_manha', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar', 'ceia')),
  meal_time TIME,
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create meal_ingredients table
CREATE TABLE IF NOT EXISTS public.meal_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE,
  food_id BIGINT REFERENCES public.foods_free(id) ON DELETE CASCADE,
  quantity_grams NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for diet_plans
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'diet_plans' AND policyname = 'Users can view own diet plans') THEN
    ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Policies for diet_plans
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'diet_plans' AND policyname = 'Users can view own diet plans') THEN
    CREATE POLICY "Users can view own diet plans" ON public.diet_plans
    FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'diet_plans' AND policyname = 'Users can insert own diet plans') THEN
    CREATE POLICY "Users can insert own diet plans" ON public.diet_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'diet_plans' AND policyname = 'Users can update own diet plans') THEN
    CREATE POLICY "Users can update own diet plans" ON public.diet_plans
    FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'diet_plans' AND policyname = 'Users can delete own diet plans') THEN
    CREATE POLICY "Users can delete own diet plans" ON public.diet_plans
    FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Enable RLS for meals
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meals' AND policyname = 'Users can view own meals') THEN
    ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Policies for meals
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meals' AND policyname = 'Users can view own meals') THEN
    CREATE POLICY "Users can view own meals" ON public.meals
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.diet_plans 
        WHERE diet_plans.id = meals.diet_plan_id 
        AND diet_plans.user_id = auth.uid()
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meals' AND policyname = 'Users can insert own meals') THEN
    CREATE POLICY "Users can insert own meals" ON public.meals
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.diet_plans 
        WHERE diet_plans.id = meals.diet_plan_id 
        AND diet_plans.user_id = auth.uid()
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meals' AND policyname = 'Users can update own meals') THEN
    CREATE POLICY "Users can update own meals" ON public.meals
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.diet_plans 
        WHERE diet_plans.id = meals.diet_plan_id 
        AND diet_plans.user_id = auth.uid()
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meals' AND policyname = 'Users can delete own meals') THEN
    CREATE POLICY "Users can delete own meals" ON public.meals
    FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM public.diet_plans 
        WHERE diet_plans.id = meals.diet_plan_id 
        AND diet_plans.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Enable RLS for meal_ingredients
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meal_ingredients' AND policyname = 'Users can view own meal ingredients') THEN
    ALTER TABLE public.meal_ingredients ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Policies for meal_ingredients
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meal_ingredients' AND policyname = 'Users can view own meal ingredients') THEN
    CREATE POLICY "Users can view own meal ingredients" ON public.meal_ingredients
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.meals 
        JOIN public.diet_plans ON diet_plans.id = meals.diet_plan_id
        WHERE meals.id = meal_ingredients.meal_id 
        AND diet_plans.user_id = auth.uid()
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meal_ingredients' AND policyname = 'Users can insert own meal ingredients') THEN
    CREATE POLICY "Users can insert own meal ingredients" ON public.meal_ingredients
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.meals 
        JOIN public.diet_plans ON diet_plans.id = meals.diet_plan_id
        WHERE meals.id = meal_ingredients.meal_id 
        AND diet_plans.user_id = auth.uid()
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meal_ingredients' AND policyname = 'Users can update own meal ingredients') THEN
    CREATE POLICY "Users can update own meal ingredients" ON public.meal_ingredients
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.meals 
        JOIN public.diet_plans ON diet_plans.id = meals.diet_plan_id
        WHERE meals.id = meal_ingredients.meal_id 
        AND diet_plans.user_id = auth.uid()
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meal_ingredients' AND policyname = 'Users can delete own meal ingredients') THEN
    CREATE POLICY "Users can delete own meal ingredients" ON public.meal_ingredients
    FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM public.meals 
        JOIN public.diet_plans ON diet_plans.id = meals.diet_plan_id
        WHERE meals.id = meal_ingredients.meal_id 
        AND diet_plans.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Create triggers for updated_at columns using existing function
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_diet_plans_updated_at' 
    AND event_object_table = 'diet_plans'
  ) THEN
    CREATE TRIGGER update_diet_plans_updated_at
    BEFORE UPDATE ON public.diet_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_meals_updated_at' 
    AND event_object_table = 'meals'
  ) THEN
    CREATE TRIGGER update_meals_updated_at
    BEFORE UPDATE ON public.meals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Create meal_nutrition view for dashboard analytics
CREATE OR REPLACE VIEW public.meal_nutrition AS
SELECT 
  dp.user_id,
  m.id as meal_id,
  m.name as meal_name,
  m.meal_type,
  dp.name as diet_plan_name,
  EXTRACT(DOW FROM m.created_at) as day_of_week,
  DATE(m.created_at) as meal_date,
  SUM((f.calories_per_100g * mi.quantity_grams / 100)) as total_calories,
  SUM((f.protein_per_100g * mi.quantity_grams / 100)) as total_protein,
  SUM((f.carbs_per_100g * mi.quantity_grams / 100)) as total_carbs,
  SUM((f.fats_per_100g * mi.quantity_grams / 100)) as total_fats,
  SUM((f.fiber_per_100g * mi.quantity_grams / 100)) as total_fiber
FROM public.meals m
JOIN public.diet_plans dp ON dp.id = m.diet_plan_id
JOIN public.meal_ingredients mi ON mi.meal_id = m.id
JOIN public.foods_free f ON f.id = mi.food_id
GROUP BY dp.user_id, m.id, m.name, m.meal_type, dp.name, m.created_at;
