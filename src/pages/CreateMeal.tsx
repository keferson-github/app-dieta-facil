import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, ChefHat, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Food = Tables<"foods_free">;
interface SelectedIngredient {
  food: Food;
  quantity: number;
}

const CreateMeal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [mealName, setMealName] = useState("");
  const [mealType, setMealType] = useState("");
  const [mealTime, setMealTime] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const loadFoods = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('foods_free')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setFoods(data || []);
    } catch (error) {
      console.error('Erro ao carregar alimentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alimentos.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  const addIngredient = (food: Food) => {
    const existingIndex = selectedIngredients.findIndex(ing => ing.food.id === food.id);
    
    if (existingIndex >= 0) {
      const updated = [...selectedIngredients];
      updated[existingIndex].quantity += 100;
      setSelectedIngredients(updated);
    } else {
      setSelectedIngredients([...selectedIngredients, { food, quantity: 100 }]);
    }
    setSearchTerm("");
  };

  const updateIngredientQuantity = (index: number, quantity: number) => {
    const updated = [...selectedIngredients];
    updated[index].quantity = Math.max(0, quantity);
    setSelectedIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  const calculateNutrition = () => {
    return selectedIngredients.reduce((total, ingredient) => {
      const multiplier = ingredient.quantity / 100;
      return {
        calories: total.calories + (ingredient.food.calories_per_100g * multiplier),
        protein: total.protein + ((ingredient.food.protein_per_100g || 0) * multiplier),
        carbs: total.carbs + ((ingredient.food.carbs_per_100g || 0) * multiplier),
        fats: total.fats + ((ingredient.food.fats_per_100g || 0) * multiplier),
        fiber: total.fiber + ((ingredient.food.fiber_per_100g || 0) * multiplier),
      };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });
  };

  const saveMeal = async () => {
    if (!mealName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um nome para a refeição.",
        variant: "destructive",
      });
      return;
    }

    if (selectedIngredients.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, adicione pelo menos um ingrediente.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Criar ou buscar um plano de dieta padrão para o usuário
      const { data: dietPlanData, error: dietPlanError } = await supabase
        .from('diet_plans')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'Plano Pessoal')
        .single();

      let dietPlan = dietPlanData;

      if (dietPlanError && dietPlanError.code === 'PGRST116') {
        // Plano não existe, criar um novo
        const { data: newPlan, error: planError } = await supabase
          .from('diet_plans')
          .insert({
            user_id: user.id,
            name: 'Plano Pessoal',
            description: 'Plano de dieta personalizado'
          })
          .select()
          .single();
        
        if (planError) throw planError;
        dietPlan = newPlan;
      } else if (dietPlanError) {
        throw dietPlanError;
      }

      if (!dietPlan) {
        throw new Error("Erro ao criar ou buscar plano de dieta");
      }

      // Criar a refeição
      const { data: meal, error: mealError } = await supabase
        .from('meals')
        .insert({
          diet_plan_id: dietPlan.id,
          name: mealName.trim(),
          meal_type: mealType || null,
          meal_time: mealTime || null,
          instructions: instructions.trim() || null,
        })
        .select()
        .single();

      if (mealError) throw mealError;

      // Adicionar ingredientes
      const ingredients = selectedIngredients.map(ingredient => ({
        meal_id: meal.id,
        food_id: ingredient.food.id,
        quantity_grams: ingredient.quantity,
      }));

      const { error: ingredientsError } = await supabase
        .from('meal_ingredients')
        .insert(ingredients);

      if (ingredientsError) throw ingredientsError;

      toast({
        title: "Sucesso!",
        description: "Refeição criada com sucesso!",
      });

      // Limpar formulário após sucesso
      setMealName("");
      setMealType("");
      setMealTime("");
      setInstructions("");
      setSelectedIngredients([]);

      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao salvar refeição:', error);
      
      // Verificar se é erro de tabela não existente
      let errorMessage = "Não foi possível salvar a refeição. Tente novamente.";
      
      if (error instanceof Error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          errorMessage = "As tabelas de refeições ainda não foram criadas no banco de dados. Entre em contato com o suporte.";
        } else if (error.message.includes('Usuário não autenticado')) {
          errorMessage = "Você precisa estar logado para salvar uma refeição.";
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const nutrition = calculateNutrition();

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-5xl">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-health p-6 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Criar Nova Refeição
                </h1>
                <p className="text-gray-600">
                  Monte sua refeição personalizada com os nutrientes ideais
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card className="glass-effect shadow-health">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-health-500" />
                  Informações da Refeição
                </CardTitle>
                <CardDescription>
                  Defina os detalhes básicos da sua refeição
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mealName">Nome da Refeição</Label>
                    <Input
                      id="mealName"
                      placeholder="Ex: Peito de frango grelhado com salada"
                      value={mealName}
                      onChange={(e) => setMealName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mealType">Tipo de Refeição</Label>
                    <Select value={mealType} onValueChange={setMealType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cafe_manha">Café da Manhã</SelectItem>
                        <SelectItem value="lanche_manha">Lanche da Manhã</SelectItem>
                        <SelectItem value="almoco">Almoço</SelectItem>
                        <SelectItem value="lanche_tarde">Lanche da Tarde</SelectItem>
                        <SelectItem value="jantar">Jantar</SelectItem>
                        <SelectItem value="ceia">Ceia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mealTime">Horário Sugerido</Label>
                  <Input
                    id="mealTime"
                    type="time"
                    value={mealTime}
                    onChange={(e) => setMealTime(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instruções de Preparo</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Descreva como preparar esta refeição..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Adicionar Ingredientes */}
            <Card className="glass-effect shadow-health">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-health-500" />
                  Ingredientes
                </CardTitle>
                <CardDescription>
                  Adicione e configure os ingredientes da sua refeição
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="searchFood">Buscar Alimento</Label>
                  <Input
                    id="searchFood"
                    placeholder="Digite o nome do alimento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {searchTerm && (
                  <div className="max-h-48 overflow-y-auto border rounded-lg">
                    {filteredFoods.slice(0, 10).map((food) => (
                      <div
                        key={food.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => addIngredient(food)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{food.name}</p>
                            <p className="text-sm text-gray-500">
                              {food.calories_per_100g} kcal/100g
                            </p>
                          </div>
                          <Plus className="w-4 h-4 text-health-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ingredientes Selecionados */}
                <div className="space-y-3">
                  <h4 className="font-medium">Ingredientes Selecionados:</h4>
                  {selectedIngredients.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhum ingrediente adicionado ainda</p>
                  ) : (
                    selectedIngredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{ingredient.food.name}</p>
                          <p className="text-sm text-gray-500">
                            {Math.round(ingredient.food.calories_per_100g * ingredient.quantity / 100)} kcal
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={ingredient.quantity}
                            onChange={(e) => updateIngredientQuantity(index, parseInt(e.target.value) || 0)}
                            className="w-20 text-center"
                            min="1"
                          />
                          <span className="text-sm text-gray-500">g</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeIngredient(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Resumo Nutricional */}
          <div className="space-y-6">
            <Card className="glass-effect shadow-health sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-health-500" />
                  Resumo Nutricional
                </CardTitle>
                <CardDescription>
                  Valores nutricionais da refeição
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(nutrition.calories)}
                    </div>
                    <div className="text-sm text-blue-700">Calorias</div>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(nutrition.protein)}g
                    </div>
                    <div className="text-sm text-green-700">Proteínas</div>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {Math.round(nutrition.carbs)}g
                    </div>
                    <div className="text-sm text-yellow-700">Carboidratos</div>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(nutrition.fats)}g
                    </div>
                    <div className="text-sm text-orange-700">Gorduras</div>
                  </div>
                </div>

                {nutrition.fiber > 0 && (
                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {Math.round(nutrition.fiber)}g
                    </div>
                    <div className="text-sm text-purple-700">Fibras</div>
                  </div>
                )}

                <Button
                  onClick={saveMeal}
                  disabled={loading || !mealName.trim() || selectedIngredients.length === 0}
                  className="w-full health-gradient shadow-health hover:shadow-lg transition-all"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Salvando...
                    </div>
                  ) : (
                    <>
                      <ChefHat className="w-4 h-4 mr-2" />
                      Salvar Refeição
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMeal;
