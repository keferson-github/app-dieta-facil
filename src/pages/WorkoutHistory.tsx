import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dumbbell, 
  Calendar, 
  Clock, 
  Search, 
  Filter,
  Activity,
  Timer,
  Plus,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface WorkoutLog {
  id: string;
  workout_name: string;
  workout_type: string;
  duration_minutes: number;
  calories_burned: number;
  exercises_count: number;
  logged_at: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
}

const WorkoutHistory = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    loadWorkoutHistory();
  }, []);

  const loadWorkoutHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('workout_logs')
        .select(`
          id,
          workout_name,
          workout_type,
          duration_minutes,
          calories_burned,
          difficulty_level,
          logged_at,
          exercises:workout_exercises(count)
        `)
        .eq('user_id', session.user.id)
        .order('logged_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedWorkouts = (data || []).map(workout => ({
        ...workout,
        exercises_count: workout.exercises?.[0]?.count || 0
      }));

      setWorkouts(formattedWorkouts);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de treinos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getWorkoutTypeLabel = (type: string) => {
    const types = {
      strength: "Musculação",
      cardio: "Cardio",
      flexibility: "Flexibilidade",
      sports: "Esportes",
      mixed: "Misto"
    };
    return types[type as keyof typeof types] || type;
  };

  const getWorkoutTypeColor = (type: string) => {
    const colors = {
      strength: "bg-red-100 text-red-800",
      cardio: "bg-blue-100 text-blue-800",
      flexibility: "bg-green-100 text-green-800",
      sports: "bg-purple-100 text-purple-800",
      mixed: "bg-orange-100 text-orange-800"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getDifficultyColor = (level: string) => {
    const colors = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-yellow-100 text-yellow-800",
      advanced: "bg-red-100 text-red-800"
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getDifficultyLabel = (level: string) => {
    const labels = {
      beginner: "Iniciante",
      intermediate: "Intermediário", 
      advanced: "Avançado"
    };
    return labels[level as keyof typeof labels] || level;
  };

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.workout_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || workout.workout_type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 health-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-secondary-dark">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 health-gradient rounded-2xl flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary-dark">Histórico de Treinos</h1>
              <p className="text-secondary-dark">Acompanhe todos os seus treinos realizados</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar treinos..."
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
                Todos
              </Button>
              <Button
                variant={filterType === "strength" ? "default" : "outline"}
                onClick={() => setFilterType("strength")}
                size="sm"
              >
                Musculação
              </Button>
              <Button
                variant={filterType === "cardio" ? "default" : "outline"}
                onClick={() => setFilterType("cardio")}
                size="sm"
              >
                Cardio
              </Button>
              <Button
                variant={filterType === "flexibility" ? "default" : "outline"}
                onClick={() => setFilterType("flexibility")}
                size="sm"
              >
                Flexibilidade
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/create-workout-plan')}
              className="health-gradient shadow-health"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Treino
            </Button>
            <Button 
              onClick={() => navigate('/exercise-library')}
              variant="outline"
              className="border-health-200 hover:bg-health-50"
            >
              <Activity className="w-4 h-4 mr-2" />
              Biblioteca de Exercícios
            </Button>
          </div>
        </div>

        {/* Workouts List */}
        {filteredWorkouts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Dumbbell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchTerm || filterType !== "all" ? "Nenhum treino encontrado" : "Nenhum treino registrado"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterType !== "all" 
                  ? "Tente ajustar os filtros de busca" 
                  : "Comece registrando seu primeiro treino"}
              </p>
              <Button 
                onClick={() => navigate('/create-workout-plan')}
                className="health-gradient shadow-health"
              >
                <Plus className="w-4 h-4 mr-2" />
                Registrar Primeiro Treino
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredWorkouts.map((workout) => (
              <Card key={workout.id} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-health-100 dark:bg-health-900/30 rounded-xl flex items-center justify-center">
                        <Activity className="w-6 h-6 text-health-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-primary-dark">{workout.workout_name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge className={getWorkoutTypeColor(workout.workout_type)}>
                            {getWorkoutTypeLabel(workout.workout_type)}
                          </Badge>
                          <Badge className={getDifficultyColor(workout.difficulty_level)}>
                            {getDifficultyLabel(workout.difficulty_level)}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            {new Date(workout.logged_at).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(workout.logged_at).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">{workout.duration_minutes}</div>
                        <div className="text-xs text-gray-500">minutos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-orange-600">{workout.calories_burned}</div>
                        <div className="text-xs text-gray-500">calorias</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">{workout.exercises_count}</div>
                        <div className="text-xs text-gray-500">exercícios</div>
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
        {filteredWorkouts.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-health-500" />
                Resumo do Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-health-600">{filteredWorkouts.length}</div>
                  <div className="text-sm text-gray-500">Treinos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(filteredWorkouts.reduce((acc, workout) => acc + workout.duration_minutes, 0) / 60)}h
                  </div>
                  <div className="text-sm text-gray-500">Tempo total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {filteredWorkouts.reduce((acc, workout) => acc + workout.calories_burned, 0)}
                  </div>
                  <div className="text-sm text-gray-500">Calorias queimadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(filteredWorkouts.reduce((acc, workout) => acc + workout.duration_minutes, 0) / filteredWorkouts.length)}
                  </div>
                  <div className="text-sm text-gray-500">Duração média (min)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WorkoutHistory;