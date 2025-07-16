import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ChefHat, 
  Calendar, 
  Clock, 
  Search, 
  Filter,
  Apple,
  Utensils,
  Plus,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";

interface MealLog {
  id: string;
  meal_name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  total_calories: number;
  logged_at: string;
  ingredients_count: number;
}

const MealHistory = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    loadMealHistory();
  }, []);

  const loadMealHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('meal_logs')
        .select(`
          id,
          meal_name,
          meal_type,
          total_calories,
          logged_at,
          ingredients:meal_ingredients(count)
        `)
        .eq('user_id', session.user.id)
        .order('logged_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedMeals = (data || []).map(meal => ({
        ...meal,
        ingredients_count: meal.ingredients?.[0]?.count || 0
      }));

      setMeals(formattedMeals);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de refeições",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMealTypeLabel = (type: string) => {
    const types = {
      breakfast: "Café da Manhã",
      lunch: "Almoço", 
      dinner: "Jantar",
      snack: "Lanche"
    };
    return types[type as keyof typeof types] || type;
  };

  const getMealTypeColor = (type: string) => {
    const colors = {
      breakfast: "bg-yellow-100 text-yellow-800",
      lunch: "bg-green-100 text-green-800",
      dinner: "bg-blue-100 text-blue-800", 
      snack: "bg-purple-100 text-purple-800"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.meal_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || meal.meal_type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Layout title="Histórico de Refeições" description="Carregando suas refeições...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 health-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-500 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-secondary-dark">Carregando histórico...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="🍽️ Histórico de Refeições" 
      description="Acompanhe todas as suas refeições registradas"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar refeições..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              onClick={() => setFilterType("all")}
              size="sm"
            >
              Todas
            </Button>
            <Button
              variant={filterType === "breakfast" ? "default" : "outline"}
              onClick={() => setFilterType("breakfast")}
              size="sm"
            >
              Café
            </Button>
            <Button
              variant={filterType === "lunch" ? "default" : "outline"}
              onClick={() => setFilterType("lunch")}
              size="sm"
            >
              Almoço
            </Button>
            <Button
              variant={filterType === "dinner" ? "default" : "outline"}
              onClick={() => setFilterType("dinner")}
              size="sm"
            >
              Jantar
            </Button>
            <Button
              variant={filterType === "snack" ? "default" : "outline"}
              onClick={() => setFilterType("snack")}
              size="sm"
            >
              Lanche
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={() => navigate('/create-meal')}
            className="health-gradient shadow-health"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Refeição
          </Button>
          <Button 
            onClick={() => navigate('/weekly-menu')}
            variant="outline"
            className="border-health-200 hover:bg-health-50"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Cardápio Semanal
          </Button>
        </div>

        {/* Meals List */}
        {filteredMeals.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchTerm || filterType !== "all" ? "Nenhuma refeição encontrada" : "Nenhuma refeição registrada"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterType !== "all" 
                  ? "Tente ajustar os filtros de busca" 
                  : "Comece registrando sua primeira refeição"}
              </p>
              <Button 
                onClick={() => navigate('/create-meal')}
                className="health-gradient shadow-health"
              >
                <Plus className="w-4 h-4 mr-2" />
                Registrar Primeira Refeição
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredMeals.map((meal) => (
              <Card key={meal.id} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-health-100 dark:bg-health-900/30 rounded-xl flex items-center justify-center">
                        <Utensils className="w-6 h-6 text-health-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-primary-dark">{meal.meal_name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge className={getMealTypeColor(meal.meal_type)}>
                            {getMealTypeLabel(meal.meal_type)}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            {new Date(meal.logged_at).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(meal.logged_at).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-health-600">{meal.total_calories}</div>
                        <div className="text-sm text-gray-500">calorias</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-700">{meal.ingredients_count}</div>
                        <div className="text-sm text-gray-500">ingredientes</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {filteredMeals.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="w-5 h-5 text-health-500" />
                Resumo do Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-health-600">{filteredMeals.length}</div>
                  <div className="text-sm text-gray-500">Refeições</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(filteredMeals.reduce((acc, meal) => acc + meal.total_calories, 0) / filteredMeals.length)}
                  </div>
                  <div className="text-sm text-gray-500">Calorias/dia (média)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredMeals.reduce((acc, meal) => acc + meal.total_calories, 0)}
                  </div>
                  <div className="text-sm text-gray-500">Total de calorias</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(filteredMeals.reduce((acc, meal) => acc + meal.ingredients_count, 0) / filteredMeals.length)}
                  </div>
                  <div className="text-sm text-gray-500">Ingredientes/refeição</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default MealHistory;