CREATE TABLE IF NOT EXISTS public.foods_free (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  calories_per_100g NUMERIC NOT NULL,
  protein_per_100g NUMERIC NOT NULL,
  carbs_per_100g NUMERIC NOT NULL,
  fats_per_100g NUMERIC NOT NULL,
  fiber_per_100g NUMERIC NOT NULL,
  category TEXT NOT NULL
);

-- Add unique constraint to foods_free name if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'foods_free_name_unique' 
    AND table_name = 'foods_free'
  ) THEN
    ALTER TABLE public.foods_free ADD CONSTRAINT foods_free_name_unique UNIQUE (name);
  END IF;
END $$;

INSERT INTO public.foods_free (name, calories_per_100g, protein_per_100g, carbs_per_100g, fats_per_100g, fiber_per_100g, category) VALUES
  ('Peito de Frango Grelhado', 165, 31.0, 0.0, 3.6, 0.0, 'Proteínas'),
  ('Ovo Cozido', 155, 13.0, 1.1, 11.0, 0.0, 'Proteínas'),
  ('Salmão Grelhado', 208, 25.4, 0.0, 12.4, 0.0, 'Proteínas'),
  ('Carne Bovina Magra', 250, 26.0, 0.0, 15.0, 0.0, 'Proteínas'),
  ('Tilápia', 96, 20.1, 0.0, 1.7, 0.0, 'Proteínas'),
  ('Peito de Peru', 135, 24.0, 0.0, 3.2, 0.0, 'Proteínas'),
  ('Arroz Integral Cozido', 111, 2.6, 22.0, 0.9, 1.8, 'Carboidratos'),
  ('Arroz Branco Cozido', 111, 2.6, 22.0, 0.9, 1.8, 'Carboidratos'),
  ('Batata Doce Cozida', 86, 1.6, 20.1, 0.1, 3.0, 'Carboidratos'),
  ('Batata Inglesa Cozida', 77, 2.0, 17.5, 0.1, 2.2, 'Carboidratos'),
  ('Pão Integral', 247, 13.0, 41.0, 4.2, 9.0, 'Carboidratos'),
  ('Macarrão Integral Cozido', 124, 5.0, 25.0, 1.1, 3.2, 'Carboidratos'),
  ('Quinoa Cozida', 120, 4.4, 21.3, 1.9, 2.8, 'Carboidratos'),
  ('Aveia', 389, 16.9, 66.3, 6.9, 10.6, 'Carboidratos'),
  ('Brócolis', 34, 2.8, 7.0, 0.4, 2.6, 'Vegetais'),
  ('Espinafre', 23, 2.9, 3.6, 0.4, 2.2, 'Vegetais'),
  ('Couve-flor', 25, 1.9, 5.0, 0.3, 2.0, 'Vegetais'),
  ('Cenoura', 41, 0.9, 9.6, 0.2, 2.8, 'Vegetais'),
  ('Tomate', 18, 0.9, 3.9, 0.2, 1.2, 'Vegetais'),
  ('Pepino', 16, 0.7, 3.6, 0.1, 0.5, 'Vegetais'),
  ('Alface', 14, 1.4, 2.9, 0.1, 1.3, 'Vegetais'),
  ('Abobrinha', 17, 1.2, 3.1, 0.3, 1.0, 'Vegetais'),
  ('Abacate', 160, 2.0, 8.5, 14.7, 6.7, 'Gorduras'),
  ('Azeite de Oliva', 884, 0.0, 0.0, 100.0, 0.0, 'Gorduras'),
  ('Castanha do Pará', 656, 14.3, 12.3, 66.4, 7.5, 'Oleaginosas'),
  ('Amêndoas', 579, 21.2, 21.6, 49.9, 12.5, 'Oleaginosas'),
  ('Nozes', 654, 15.2, 13.7, 65.2, 6.7, 'Oleaginosas'),
  ('Iogurte Grego Natural', 59, 10.0, 3.6, 0.4, 0.0, 'Laticínios'),
  ('Queijo Cottage', 98, 11.1, 3.4, 4.3, 0.0, 'Laticínios'),
  ('Leite Desnatado', 34, 3.4, 5.0, 0.1, 0.0, 'Laticínios'),
  ('Banana', 89, 1.1, 22.8, 0.3, 2.6, 'Frutas'),
  ('Maçã', 52, 0.3, 13.8, 0.2, 2.4, 'Frutas'),
  ('Morango', 32, 0.7, 7.7, 0.3, 2.0, 'Frutas'),
  ('Laranja', 47, 0.9, 11.8, 0.1, 2.4, 'Frutas'),
  ('Manga', 60, 0.8, 15.0, 0.4, 1.6, 'Frutas'),
  ('Feijão Preto Cozido', 132, 8.9, 23.0, 0.5, 8.7, 'Leguminosas'),
  ('Lentilha Cozida', 116, 9.0, 20.1, 0.4, 7.9, 'Leguminosas'),
  ('Grão de Bico Cozido', 164, 8.9, 27.4, 2.6, 7.6, 'Leguminosas'),
  ('Azeite Extra Virgem', 884, 0.0, 0.0, 100.0, 0.0, 'Gorduras'),
  ('Sal', 0, 0.0, 0.0, 0.0, 0.0, 'Temperos'),
  ('Pimenta do Reino', 251, 10.4, 63.9, 3.3, 25.3, 'Temperos'),
  ('Alho', 149, 6.4, 33.1, 0.5, 2.1, 'Temperos'),
  ('Cebola', 40, 1.1, 9.3, 0.1, 1.7, 'Temperos')
ON CONFLICT (name) DO NOTHING;