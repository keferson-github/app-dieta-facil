-- Create diet_plans table
CREATE TABLE public.diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create meals table
CREATE TABLE public.meals (
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
CREATE TABLE public.meal_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE,
  food_id TEXT REFERENCES public.foods(id) ON DELETE CASCADE,
  quantity_grams NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for diet_plans
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;

-- Policies for diet_plans
CREATE POLICY "Users can view own diet plans" ON public.diet_plans
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diet plans" ON public.diet_plans
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diet plans" ON public.diet_plans
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diet plans" ON public.diet_plans
FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS for meals
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- Policies for meals
CREATE POLICY "Users can view own meals" ON public.meals
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.diet_plans 
    WHERE diet_plans.id = meals.diet_plan_id 
    AND diet_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own meals" ON public.meals
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.diet_plans 
    WHERE diet_plans.id = meals.diet_plan_id 
    AND diet_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own meals" ON public.meals
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.diet_plans 
    WHERE diet_plans.id = meals.diet_plan_id 
    AND diet_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own meals" ON public.meals
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.diet_plans 
    WHERE diet_plans.id = meals.diet_plan_id 
    AND diet_plans.user_id = auth.uid()
  )
);

-- Enable RLS for meal_ingredients
ALTER TABLE public.meal_ingredients ENABLE ROW LEVEL SECURITY;

-- Policies for meal_ingredients
CREATE POLICY "Users can view own meal ingredients" ON public.meal_ingredients
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.meals 
    JOIN public.diet_plans ON diet_plans.id = meals.diet_plan_id
    WHERE meals.id = meal_ingredients.meal_id 
    AND diet_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own meal ingredients" ON public.meal_ingredients
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.meals 
    JOIN public.diet_plans ON diet_plans.id = meals.diet_plan_id
    WHERE meals.id = meal_ingredients.meal_id 
    AND diet_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own meal ingredients" ON public.meal_ingredients
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.meals 
    JOIN public.diet_plans ON diet_plans.id = meals.diet_plan_id
    WHERE meals.id = meal_ingredients.meal_id 
    AND diet_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own meal ingredients" ON public.meal_ingredients
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.meals 
    JOIN public.diet_plans ON diet_plans.id = meals.diet_plan_id
    WHERE meals.id = meal_ingredients.meal_id 
    AND diet_plans.user_id = auth.uid()
  )
);

-- Create triggers for updated_at columns using existing function
CREATE TRIGGER update_diet_plans_updated_at
BEFORE UPDATE ON public.diet_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meals_updated_at
BEFORE UPDATE ON public.meals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
