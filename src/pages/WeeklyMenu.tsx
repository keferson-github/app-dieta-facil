import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, ChefHat, Plus, Clock, Users, Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

const daysOfWeek = [
  { day: 0, name: "Domingo", short: "Dom" },
  { day: 1, name: "Segunda-feira", short: "Seg" },
  { day: 2, name: "Terça-feira", short: "Ter" },
  { day: 3, name: "Quarta-feira", short: "Qua" },
  { day: 4, name: "Quinta-feira", short: "Qui" },
  { day: 5, name: "Sexta-feira", short: "Sex" },
  { day: 6, name: "Sábado", short: "Sáb" },
];

const mealTypes = [
  { value: "cafe_manha", label: "Café da Manhã", icon: "☀️" },
  { value: "lanche_manha", label: "Lanche da Manhã", icon: "🥞" },
  { value: "almoco", label: "Almoço", icon: "🍽️" },
  { value: "lanche_tarde", label: "Lanche da Tarde", icon: "🍪" },
  { value: "jantar", label: "Jantar", icon: "🌙" },
  { value: "ceia", label: "Ceia", icon: "🌃" },
];

type Meal = Tables<"meals"> & {
  meal_ingredients: Array<Tables<"meal_ingredients"> & {
    foods: Tables<"foods">;
  }>;
};

interface WeeklyMeal {
  day: number;
  meals: Meal[];
}

const WeeklyMenu = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [weeklyMeals, setWeeklyMeals] = useState<WeeklyMeal[]>([]);
  const [userMeals, setUserMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUserMeals = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('meals')
        .select(`
          *,
          meal_ingredients (
            *,
            foods (*)
          )
        `)
        .eq('diet_plan_id', (
          await supabase
            .from('diet_plans')
            .select('id')
            .eq('user_id', user.id)
            .single()
        ).data?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserMeals(data || []);
    } catch (error) {
      console.error('Erro ao carregar refeições:', error);
    }
  }, []);

  const loadWeeklyMenu = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: dietPlan } = await supabase
        .from('diet_plans')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!dietPlan) return;

      const { data, error } = await supabase
        .from('meals')
        .select(`
          *,
          meal_ingredients (
            *,
            foods (*)
          )
        `)
        .eq('diet_plan_id', dietPlan.id)
        .not('day_of_week', 'is', null)
        .order('day_of_week')
        .order('meal_time');

      if (error) throw error;

      // Organizar refeições por dia da semana
      const organizedMeals = daysOfWeek.map(day => ({
        day: day.day,
        meals: (data || []).filter(meal => meal.day_of_week === day.day)
      }));

      setWeeklyMeals(organizedMeals);
    } catch (error) {
      console.error('Erro ao carregar cardápio semanal:', error);
    }
  }, []);

  useEffect(() => {
    loadUserMeals();
    loadWeeklyMenu();
  }, [loadUserMeals, loadWeeklyMenu]);

  const addMealToDay = async (meal: Meal, dayOfWeek: number) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('meals')
        .update({ day_of_week: dayOfWeek })
        .eq('id', meal.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Refeição adicionada ao ${daysOfWeek[dayOfWeek].name}`,
      });

      loadWeeklyMenu();
    } catch (error) {
      console.error('Erro ao adicionar refeição:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a refeição ao cardápio.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeMealFromDay = async (mealId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('meals')
        .update({ day_of_week: null })
        .eq('id', mealId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Refeição removida do cardápio",
      });

      loadWeeklyMenu();
    } catch (error) {
      console.error('Erro ao remover refeição:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a refeição do cardápio.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMealNutrition = (meal: Meal) => {
    if (!meal.meal_ingredients) return { calories: 0, protein: 0 };
    
    return meal.meal_ingredients.reduce((total, ingredient) => {
      const multiplier = ingredient.quantity_grams / 100;
      return {
        calories: total.calories + (ingredient.foods.calories_per_100g * multiplier),
        protein: total.protein + ((ingredient.foods.protein_per_100g || 0) * multiplier),
      };
    }, { calories: 0, protein: 0 });
  };

  const getMealTypeIcon = (mealType: string | null) => {
    return mealTypes.find(type => type.value === mealType)?.icon || "🍽️";
  };

  const getMealTypeLabel = (mealType: string | null) => {
    return mealTypes.find(type => type.value === mealType)?.label || "Refeição";
  };

  const availableMeals = userMeals.filter(meal => meal.day_of_week === null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
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
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Cardápio Semanal
                </h1>
                <p className="text-gray-600">
                  Organize suas refeições para toda a semana
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Refeições Disponíveis */}
          <div className="xl:col-span-1">
            <Card className="glass-effect shadow-health sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-health-500" />
                  Suas Refeições
                </CardTitle>
                <CardDescription>
                  Arraste para adicionar ao cardápio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableMeals.length === 0 ? (
                  <div className="text-center py-8">
                    <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      Nenhuma refeição disponível
                    </p>
                    <Button
                      onClick={() => navigate('/create-meal')}
                      className="health-gradient"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Refeição
                    </Button>
                  </div>
                ) : (
                  availableMeals.map((meal) => {
                    const nutrition = calculateMealNutrition(meal);
                    return (
                      <div
                        key={meal.id}
                        className="p-3 bg-white rounded-lg border border-gray-200 hover:border-health-300 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{meal.name}</h4>
                          <span className="text-lg">{getMealTypeIcon(meal.meal_type)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {getMealTypeLabel(meal.meal_type)}
                          </Badge>
                          {meal.meal_time && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {meal.meal_time}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="font-bold text-blue-600">
                              {Math.round(nutrition.calories)}
                            </div>
                            <div className="text-blue-700">kcal</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className="font-bold text-green-600">
                              {Math.round(nutrition.protein)}g
                            </div>
                            <div className="text-green-700">prot</div>
                          </div>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-7 gap-1">
                          {daysOfWeek.map((day) => (
                            <Button
                              key={day.day}
                              size="sm"
                              variant="outline"
                              className="text-xs p-1 h-8"
                              onClick={() => addMealToDay(meal, day.day)}
                              disabled={loading}
                            >
                              {day.short}
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cardápio Semanal */}
          <div className="xl:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {weeklyMeals.map((weekDay, dayIndex) => (
                <Card key={weekDay.day} className="glass-effect shadow-health">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">
                        {dayIndex === 0 ? "☀️" : dayIndex === 6 ? "🌙" : "📅"}
                      </span>
                      {daysOfWeek[weekDay.day].name}
                    </CardTitle>
                    <CardDescription>
                      {weekDay.meals.length} refeição(ões) planejada(s)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {weekDay.meals.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Nenhuma refeição planejada</p>
                      </div>
                    ) : (
                      weekDay.meals
                        .sort((a, b) => (a.meal_time || "").localeCompare(b.meal_time || ""))
                        .map((meal) => {
                          const nutrition = calculateMealNutrition(meal);
                          return (
                            <div
                              key={meal.id}
                              className="p-3 bg-white rounded-lg border border-gray-200 group hover:border-red-300 transition-all"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-medium text-sm">{meal.name}</h5>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeMealFromDay(meal.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1 h-auto"
                                >
                                  ×
                                </Button>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm">{getMealTypeIcon(meal.meal_type)}</span>
                                <Badge variant="outline" className="text-xs">
                                  {getMealTypeLabel(meal.meal_type)}
                                </Badge>
                                {meal.meal_time && (
                                  <Badge variant="outline" className="text-xs">
                                    {meal.meal_time}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="text-center p-2 bg-blue-50 rounded">
                                  <div className="font-bold text-blue-600">
                                    {Math.round(nutrition.calories)}
                                  </div>
                                  <div className="text-blue-700">kcal</div>
                                </div>
                                <div className="text-center p-2 bg-green-50 rounded">
                                  <div className="font-bold text-green-600">
                                    {Math.round(nutrition.protein)}g
                                  </div>
                                  <div className="text-green-700">prot</div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Resumo Semanal */}
            <Card className="glass-effect shadow-health mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-health-500" />
                  Resumo Nutricional Semanal
                </CardTitle>
                <CardDescription>
                  Média diária dos seus valores nutricionais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(() => {
                    const totalMeals = weeklyMeals.reduce((total, day) => total + day.meals.length, 0);
                    const totalCalories = weeklyMeals.reduce((total, day) => 
                      total + day.meals.reduce((dayTotal, meal) => 
                        dayTotal + calculateMealNutrition(meal).calories, 0), 0);
                    const totalProtein = weeklyMeals.reduce((total, day) => 
                      total + day.meals.reduce((dayTotal, meal) => 
                        dayTotal + calculateMealNutrition(meal).protein, 0), 0);
                    
                    const avgCalories = totalMeals > 0 ? totalCalories / 7 : 0;
                    const avgProtein = totalMeals > 0 ? totalProtein / 7 : 0;

                    return (
                      <>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {Math.round(avgCalories)}
                          </div>
                          <div className="text-sm text-blue-700">Kcal/dia</div>
                        </div>
                        
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {Math.round(avgProtein)}g
                          </div>
                          <div className="text-sm text-green-700">Proteína/dia</div>
                        </div>
                        
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {totalMeals}
                          </div>
                          <div className="text-sm text-purple-700">Refeições</div>
                        </div>
                        
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {Math.round((totalMeals / 42) * 100)}%
                          </div>
                          <div className="text-sm text-orange-700">Completude</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyMenu;
