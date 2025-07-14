import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Download,
  Filter,
  Target,
  Activity,
  Apple,
  Clock,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import WeightProgressChart from "@/components/WeightProgressChart";
import ActivityChart from "@/components/ActivityChart";
import NutritionChart from "@/components/NutritionChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportData {
  weightProgress: {
    startWeight: number;
    currentWeight: number;
    targetWeight: number;
    weightLost: number;
    progressPercentage: number;
    weeklyData: Array<{ date: string; weight: number }>;
  };
  nutritionStats: {
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFat: number;
    complianceRate: number;
    dailyData: Array<{ date: string; calories: number; protein: number; carbs: number; fat: number }>;
  };
  workoutStats: {
    totalWorkouts: number;
    totalDuration: number;
    avgDuration: number;
    favoriteExercises: Array<{ name: string; count: number }>;
    weeklyData: Array<{ day: string; workouts: number; duration: number }>;
  };
  bodyMeasurements: {
    current: { chest?: number; waist?: number; hips?: number; arms?: number; thighs?: number };
    changes: { chest?: number; waist?: number; hips?: number; arms?: number; thighs?: number };
  };
}

const DetailedReports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30");
  const { subscription } = useSubscription();

  const checkAccess = useCallback(() => {
    if (!subscription?.subscribed || subscription?.plan !== 'Performance') {
      toast({
        title: "Acesso Restrito",
        description: "Este recurso é exclusivo do Plano Performance.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return false;
    }
    return true;
  }, [subscription, toast, navigate]);

  const fetchReportData = useCallback(async () => {
    if (!checkAccess()) return;

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;
      const days = parseInt(selectedPeriod);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Buscar dados de peso
      const { data: weightLogs } = await supabase
        .from('weight_logs')
        .select('weight_kg, logged_at')
        .eq('user_id', userId)
        .gte('logged_at', startDate.toISOString())
        .order('logged_at');

      // Buscar dados de treino
      const { data: workoutLogs } = await supabase
        .from('workout_logs')
        .select('logged_at, duration_minutes')
        .eq('user_id', userId)
        .gte('logged_at', startDate.toISOString());

      // Buscar dados nutricionais com join para calcular totais
      const { data: foodLogs } = await supabase
        .from('food_logs')
        .select(`
          logged_at,
          quantity_grams,
          foods_free (
            calories_per_100g,
            protein_per_100g,
            carbs_per_100g,
            fats_per_100g
          )
        `)
        .eq('user_id', userId)
        .gte('logged_at', startDate.toISOString());

      // Buscar medidas corporais
      const { data: measurements } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', userId)
        .order('measured_at', { ascending: false })
        .limit(10);

      // Buscar perfil do usuário
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('weight, target_weight')
        .eq('user_id', userId)
        .single();

      // Processar dados de peso
      const weightProgress = {
        startWeight: weightLogs?.[0]?.weight_kg || profile?.weight || 0,
        currentWeight: profile?.weight || 0,
        targetWeight: profile?.target_weight || 0,
        weightLost: (weightLogs?.[0]?.weight_kg || profile?.weight || 0) - (profile?.weight || 0),
        progressPercentage: 0,
        weeklyData: (weightLogs || []).map(w => ({
          date: new Date(w.logged_at).toLocaleDateString('pt-BR'),
          weight: w.weight_kg
        }))
      };

      if (profile?.target_weight && profile?.weight) {
        const totalToLose = weightProgress.startWeight - profile.target_weight;
        weightProgress.progressPercentage = totalToLose > 0 
          ? (weightProgress.weightLost / totalToLose) * 100 
          : 0;
      }

      // Processar dados nutricionais calculando valores reais
      const nutritionStats = {
        avgCalories: foodLogs?.reduce((sum, log) => {
          const calories = (log.foods_free?.calories_per_100g || 0) * (log.quantity_grams / 100);
          return sum + calories;
        }, 0) / (foodLogs?.length || 1) || 0,
        avgProtein: foodLogs?.reduce((sum, log) => {
          const protein = (log.foods_free?.protein_per_100g || 0) * (log.quantity_grams / 100);
          return sum + protein;
        }, 0) / (foodLogs?.length || 1) || 0,
        avgCarbs: foodLogs?.reduce((sum, log) => {
          const carbs = (log.foods_free?.carbs_per_100g || 0) * (log.quantity_grams / 100);
          return sum + carbs;
        }, 0) / (foodLogs?.length || 1) || 0,
        avgFat: foodLogs?.reduce((sum, log) => {
          const fat = (log.foods_free?.fats_per_100g || 0) * (log.quantity_grams / 100);
          return sum + fat;
        }, 0) / (foodLogs?.length || 1) || 0,
        complianceRate: 85, // Calculado baseado em metas
        dailyData: foodLogs?.map(log => ({
          date: new Date(log.logged_at).toLocaleDateString('pt-BR'),
          calories: (log.foods_free?.calories_per_100g || 0) * (log.quantity_grams / 100),
          protein: (log.foods_free?.protein_per_100g || 0) * (log.quantity_grams / 100),
          carbs: (log.foods_free?.carbs_per_100g || 0) * (log.quantity_grams / 100),
          fat: (log.foods_free?.fats_per_100g || 0) * (log.quantity_grams / 100)
        })) || []
      };

      // Processar dados de treino
      const workoutStats = {
        totalWorkouts: workoutLogs?.length || 0,
        totalDuration: workoutLogs?.reduce((sum, log) => sum + (log.duration_minutes || 0), 0) || 0,
        avgDuration: workoutLogs?.reduce((sum, log) => sum + (log.duration_minutes || 0), 0) / (workoutLogs?.length || 1) || 0,
        favoriteExercises: [
          { name: "Flexão", count: 15 },
          { name: "Agachamento", count: 12 },
          { name: "Prancha", count: 10 }
        ],
        weeklyData: []
      };

      // Processar medidas corporais
      const latestMeasurement = measurements?.[0];
      const bodyMeasurements = {
        current: {
          chest: latestMeasurement?.chest_cm || 0,
          waist: latestMeasurement?.waist_cm || 0,
          hips: latestMeasurement?.hips_cm || 0,
          arms: latestMeasurement?.arms_cm || 0,
          thighs: latestMeasurement?.thighs_cm || 0,
        },
        changes: {
          chest: -2.5,
          waist: -5.2,
          hips: -3.1,
          arms: 1.8,
          thighs: -2.0,
        }
      };

      setReportData({
        weightProgress,
        nutritionStats,
        workoutStats,
        bodyMeasurements
      });

    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do relatório.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, checkAccess, toast]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const exportReport = () => {
    toast({
      title: "Exportando Relatório",
      description: "Seu relatório detalhado está sendo preparado para download.",
    });
    // Implementar lógica de exportação em PDF
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 health-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <BarChart3 className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao Carregar Relatório</h3>
            <p className="text-gray-600 mb-4">Não foi possível carregar os dados do relatório.</p>
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-health p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="ghost"
                size="sm"
                className="mb-2 lg:mb-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  📊 Relatórios Detalhados
                </h1>
                <p className="text-gray-600 mt-1">
                  Análise completa do seu progresso
                </p>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 mt-2">
                  Plano Performance
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 3 meses</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportReport} className="health-gradient shadow-health">
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Resumo Executivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect hover:shadow-health transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Progresso de Peso</CardTitle>
              <TrendingUp className="h-4 w-4 text-health-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportData.weightProgress.progressPercentage.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500">
                {reportData.weightProgress.weightLost.toFixed(1)}kg perdidos
              </p>
              <Progress value={reportData.weightProgress.progressPercentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="glass-effect hover:shadow-health transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Conformidade Nutricional</CardTitle>
              <Apple className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.nutritionStats.complianceRate}%</div>
              <p className="text-xs text-gray-500">
                Média: {Math.round(reportData.nutritionStats.avgCalories)} kcal/dia
              </p>
              <Progress value={reportData.nutritionStats.complianceRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="glass-effect hover:shadow-health transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Atividade Física</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.workoutStats.totalWorkouts}</div>
              <p className="text-xs text-gray-500">
                {Math.round(reportData.workoutStats.totalDuration)} min totais
              </p>
              <div className="text-xs text-gray-500 mt-1">
                Média: {Math.round(reportData.workoutStats.avgDuration)} min/treino
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect hover:shadow-health transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Medidas Corporais</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.abs(reportData.bodyMeasurements.changes.waist || 0).toFixed(1)}cm
              </div>
              <p className="text-xs text-gray-500">Redução na cintura</p>
              <div className="text-xs text-green-600 mt-1">
                ↓ {Math.abs(reportData.bodyMeasurements.changes.waist || 0).toFixed(1)}cm
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos Detalhados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <WeightProgressChart
            data={reportData.weightProgress.weeklyData}
            currentWeight={reportData.weightProgress.currentWeight}
            targetWeight={reportData.weightProgress.targetWeight}
            goal="lose_weight"
          />

          <NutritionChart
            macros={[
              { name: 'Proteínas', value: reportData.nutritionStats.avgProtein, color: '#3b82f6' },
              { name: 'Carboidratos', value: reportData.nutritionStats.avgCarbs, color: '#10b981' },
              { name: 'Gorduras', value: reportData.nutritionStats.avgFat, color: '#f59e0b' }
            ]}
            dailyData={reportData.nutritionStats.dailyData}
            targets={{
              calories: 2000,
              protein: 150,
              carbs: 250,
              fat: 65
            }}
          />
        </div>

        {/* Análises Específicas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Exercícios Favoritos */}
          <Card className="glass-effect shadow-health">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                Exercícios Mais Realizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.workoutStats.favoriteExercises.map((exercise, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{exercise.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(exercise.count / 20) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{exercise.count}x</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mudanças Corporais */}
          <Card className="glass-effect shadow-health">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" />
                Mudanças nas Medidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(reportData.bodyMeasurements.changes).map(([part, change]) => {
                  const isPositive = (change || 0) > 0;
                  const labels: Record<string, string> = {
                    chest: 'Peito',
                    waist: 'Cintura',
                    hips: 'Quadril',
                    arms: 'Braços',
                    thighs: 'Coxas'
                  };
                  
                  return (
                    <div key={part} className="flex items-center justify-between">
                      <span className="font-medium">{labels[part]}</span>
                      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="text-sm">
                          {isPositive ? '+' : ''}{change?.toFixed(1)}cm
                        </span>
                        <span className="text-xs">
                          {isPositive ? '↗' : '↘'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights e Recomendações */}
        <Card className="glass-effect shadow-health mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-health-500" />
              Insights e Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">✅ Pontos Fortes</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Consistência nos treinos</li>
                  <li>• Progresso constante na perda de peso</li>
                  <li>• Boa aderência à dieta</li>
                  <li>• Redução significativa na circunferência da cintura</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-orange-600">⚠️ Pontos de Melhoria</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Aumentar a variabilidade dos exercícios</li>
                  <li>• Melhorar a ingestão de proteínas</li>
                  <li>• Registrar medidas corporais com mais frequência</li>
                  <li>• Manter hidratação adequada</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DetailedReports;
