-- Atualizar os nomes dos planos para os novos
UPDATE public.subscription_plans 
SET name = 'Plano Nutri', description = 'Monte refeições personalizadas para sua rotina alimentar'
WHERE stripe_price_id = 'price_1RjrkJDCD1mjfeBCXpBNOFba';

UPDATE public.subscription_plans 
SET name = 'Plano Energia', description = 'Crie refeições e treinos para manter o corpo ativo e saudável'
WHERE stripe_price_id = 'price_1RjrlkDCD1mjfeBCuRzOM1tm';

UPDATE public.subscription_plans 
SET name = 'Plano Performance', description = 'Alimentação, treinos e progresso em um só lugar. Evolua de verdade'
WHERE stripe_price_id = 'price_1RjrmdDCD1mjfeBC1QmPn7gN';