-- Criar tabela de planos de assinatura
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC NOT NULL,
  stripe_price_id TEXT NOT NULL UNIQUE,
  stripe_product_id TEXT NOT NULL,
  features TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserir os planos do Dieta Fácil
INSERT INTO public.subscription_plans (name, description, price_monthly, stripe_price_id, stripe_product_id, features) VALUES
('Plano Nutri', 'Monte refeições personalizadas para sua rotina alimentar', 19.90, 'price_1RjrkJDCD1mjfeBCXpBNOFba', 'prod_SfC8LDMcRQXlE3', ARRAY['Refeições personalizadas', 'Cardápio semanal', 'Lista de compras']),
('Plano Energia', 'Crie refeições e treinos para manter o corpo ativo e saudável', 39.90, 'price_1RjrlkDCD1mjfeBCuRzOM1tm', 'prod_SfCACY54r9Cl4m', ARRAY['Refeições personalizadas', 'Cardápio semanal', 'Lista de compras', 'Treinos personalizados', 'Acompanhamento de progresso']),
('Plano Performance', 'Alimentação, treinos e progresso em um só lugar. Evolua de verdade', 59.90, 'price_1RjrmdDCD1mjfeBC1QmPn7gN', 'prod_SfCAJzVEEwIbsM', ARRAY['Refeições personalizadas', 'Cardápio semanal', 'Lista de compras', 'Treinos personalizados', 'Acompanhamento de progresso', 'Relatórios avançados', 'Suporte prioritário']);

-- Criar tabela de assinaturas de usuários
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela de notificações
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela de metas/objetivos
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  target NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  deadline DATE,
  achieved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela de conquistas
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT
);

-- Inserir algumas conquistas básicas
INSERT INTO public.achievements (code, title, description, icon) VALUES
('first_meal_log', 'Primeira Refeição', 'Registrou sua primeira refeição', '🍽️'),
('first_workout', 'Primeiro Treino', 'Completou seu primeiro treino', '💪'),
('weight_goal_achieved', 'Meta de Peso', 'Alcançou sua meta de peso', '🎯'),
('7_day_streak', 'Sequência de 7 Dias', 'Registrou dados por 7 dias consecutivos', '🔥'),
('30_day_streak', 'Sequência de 30 Dias', 'Registrou dados por 30 dias consecutivos', '🏆');

-- Criar tabela de conquistas dos usuários
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id),
  awarded_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Políticas para subscription_plans (todos podem ver)
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans
FOR SELECT USING (true);

-- Políticas para user_subscriptions (usuários só veem suas próprias)
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.user_subscriptions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions
FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para goals
CREATE POLICY "Users can view own goals" ON public.goals
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.goals
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.goals
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.goals
FOR DELETE USING (auth.uid() = user_id);

-- Políticas para achievements (todos podem ver)
CREATE POLICY "Anyone can view achievements" ON public.achievements
FOR SELECT USING (true);

-- Políticas para user_achievements
CREATE POLICY "Users can view own user achievements" ON public.user_achievements
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user achievements" ON public.user_achievements
FOR INSERT WITH CHECK (auth.uid() = user_id);