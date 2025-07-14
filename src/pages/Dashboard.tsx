import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Settings, 
  TrendingUp, 
  Calendar, 
  Target, 
  Apple, 
  Dumbbell, 
  CreditCard,
  ChefHat,
  BarChart3,
  Trophy,
  Zap,
  Heart,
  Plus,
  ArrowRight,
  Lock,
  Activity,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PricingPlans } from "@/components/PricingPlans";
import { useSubscription } from "@/hooks/useSubscription";
import WeightProgressChart from "@/components/WeightProgressChart";
import ActivityChart from "@/components/ActivityChart";
import NutritionChart from "@/components/NutritionChart";
import AchievementsCard from "@/components/AchievementsCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getUserAchievements, type UserAchievement } from "@/lib/achievements";
import type { Tables } from "@/integrations/supabase/types";
import MobileNavigation from "@/components/MobileNavigation";
import MetricsGrid from "@/components/MetricsGrid";
import ChartsCarousel from "@/components/ChartsCarousel";

interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  stripe_price_id: string;
  features: string[];
}

// helper to get features per plan
const getPlanFeatures = (planName: string): string[] => {
  const featuresMap: Record<string, string[]> = {
    'Plano Nutri': ['Refeições personalizadas', 'Cardápio semanal', 'Controle calórico'],
    'Plano Energia': ['Refeições personalizadas', 'Cardápio semanal', 'Fichas de treino', 'Exercícios para casa/academia'],
    'Plano Performance': ['Tudo do Energia', 'Acompanhamento de progresso', 'Relatórios detalhados', 'Suporte prioritário'],
  };
  return featuresMap[planName] || [];
};


const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [userProfile, setUserProfile] = useState<Tables<"user_profiles"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState("");

  // ----- CHART DATA STATE (deve vir antes do retorno condicional) -----
  type WeightDatum = { date: string; weight: number };
  type ActivityDatum = { day: string; workouts: number; duration: number };
  type MacroDatum = { name: string; value: number; color: string };
  type DailyNutritionDatum = { date: string; calories: number; protein: number; carbs: number; fat: number };

  const [chartData, setChartData] = useState<{
    weightData: WeightDatum[];
    activityData: ActivityDatum[];
    nutritionMacros: MacroDatum[];
    dailyNutritionData: DailyNutritionDatum[];
    achievements: UserAchievement[];
    userStats: {
      total_points: number;
      current_level: number;
      meals_logged: number;
      workouts_completed: number;
      streak_days: number;
      photos_uploaded: number;
      weight_logs_count: number;
    };
    currentWeight: number;
    targetWeight: number;
    goal: 'lose_weight' | 'maintain_weight' | 'gain_muscle';
  }>({
    weightData: [],
    activityData: [],
    nutritionMacros: [],
    dailyNutritionData: [],
    achievements: [],
    userStats: {
      total_points: 0,
      current_level: 1,
      meals_logged: 0,
      workouts_completed: 0,
      streak_days: 0,
      photos_uploaded: 0,
      weight_logs_count: 0,
    },
    currentWeight: 0,
    targetWeight: 0,
    goal: 'lose_weight',
  });

  const [showPricing, setShowPricing] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const { subscription, loading: subscriptionLoading, refetch: refetchSubscription } = useSubscription();

  const loadPlans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly');

      if (error) throw error;
      const mapped = (data || []).map(p => ({
        ...p,
        features: getPlanFeatures(p.name),
      }));
      setPlans(mapped);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  }, []);

  const checkUserProfile = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        navigate('/auth');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', profileError);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seu perfil.",
          variant: "destructive",
        });
        return;
      }

      if (!profile) {
        navigate('/onboarding');
        return;
      }

      setUserProfile(profile);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [navigate, toast]);

  useEffect(() => {
    checkUserProfile();
    loadPlans();
  }, [checkUserProfile, loadPlans]);

  useEffect(() => {
    // Carregar saudação personalizada
    const loadWelcomeMessage = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const greeting = getWelcomeMessage();
        
        if (session?.user?.user_metadata?.full_name) {
          const firstName = session.user.user_metadata.full_name.split(' ')[0];
          setWelcomeMessage(`${greeting}, ${firstName}`);
        } else {
          setWelcomeMessage(greeting);
        }
      } catch (error) {
        console.error('Erro ao obter saudação personalizada:', error);
        setWelcomeMessage(getWelcomeMessage());
      }
    };
    
    loadWelcomeMessage();
  }, []);

  useEffect(() => {
    // Verificar se voltou do Stripe
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      toast({
        title: t('notifications.dashboard.welcome_team'),
        description: t('notifications.dashboard.welcome_team_desc'),
      });
      refetchSubscription();
      window.history.replaceState({}, '', '/dashboard');
    } else if (urlParams.get('canceled') === 'true') {
      toast({
        title: t('notifications.dashboard.process_canceled'),
        description: t('notifications.dashboard.process_canceled_desc'),
        variant: "destructive",
      });
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [toast, refetchSubscription, t]);

  const calculateBMI = () => {
    if (!userProfile?.weight || !userProfile?.height) return 0;
    return (userProfile.weight / Math.pow(userProfile.height / 100, 2));
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: t('dashboard.bmi_categories.underweight'), color: 'text-blue-600' };
    if (bmi < 25) return { category: t('dashboard.bmi_categories.normal'), color: 'text-health-600' };
    if (bmi < 30) return { category: t('dashboard.bmi_categories.overweight'), color: 'text-yellow-600' };
    return { category: t('dashboard.bmi_categories.obese'), color: 'text-red-600' };
  };

  const getProgressPercentage = () => {
    if (!userProfile?.weight || !userProfile?.target_weight) return 0;
    const initialWeight = userProfile.weight + 10; // Assumindo que começou 10kg acima do atual
    const progress = ((initialWeight - userProfile.weight) / (initialWeight - userProfile.target_weight)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const handleFeatureClick = (feature: string, requiredPlan: string) => {
    // Liberar recursos do Plano Nutri gratuitamente
    if (requiredPlan === 'Nutri') {
      // Navegação específica para cada recurso do Plano Nutri
      if (feature.includes('Criar Refeição') || feature.includes('create_meal') || feature === t('dashboard.nutrition.create_meal')) {
        navigate('/create-meal');
        return;
      }
      if (feature.includes('Cardápio Semanal') || feature.includes('weekly_menu') || feature === t('dashboard.nutrition.weekly_menu')) {
        navigate('/weekly-menu');
        return;
      }
      
      // Para outros recursos do Plano Nutri, mostrar "em breve"
      toast({
        title: "Recurso disponível",
        description: `${feature} está disponível gratuitamente no Plano Nutri!`,
      });
      return;
    }

    // Verificar se o usuário tem assinatura para planos superiores (Energia e Performance)
    if (!subscription?.subscribed) {
      toast({
        title: t('dashboard.premium_feature'),
        description: t('dashboard.premium_description', { plan: requiredPlan }),
        variant: "destructive",
      });
      setShowPricing(true);
      return;
    }

    const currentPlan = subscription?.plan || 'Nutri';
    const planHierarchy = ['Nutri', 'Energia', 'Performance'];
    const currentIndex = planHierarchy.indexOf(currentPlan);
    const requiredIndex = planHierarchy.indexOf(requiredPlan);

    if (currentIndex < requiredIndex) {
      toast({
        title: t('dashboard.premium_feature'),
        description: t('dashboard.premium_description', { plan: requiredPlan }),
        variant: "destructive",
      });
      setShowPricing(true);
      return;
    }

    // Navegação específica para funcionalidades do Plano Energia
    if (requiredPlan === 'Energia') {
      if (feature.includes('workout') || feature.includes('treino') || feature === t('dashboard.exercises.start_workout')) {
        navigate('/exercise-library');
        return;
      }
      if (feature.includes('workout_sheet') || feature.includes('ficha') || feature === t('dashboard.exercises.workout_sheet')) {
        navigate('/create-workout-plan');
        return;
      }
    }

    // Navegação específica para funcionalidades do Plano Performance
    if (requiredPlan === 'Performance') {
      if (feature.includes('detailed_reports') || feature.includes('relatórios') || feature === t('dashboard.progress.detailed_reports')) {
        navigate('/detailed-reports');
        return;
      }
      if (feature.includes('body_measurements') || feature.includes('medidas') || feature === t('dashboard.progress.body_measurements')) {
        navigate('/body-measurements');
        return;
      }
      if (feature.includes('progress_photos') || feature.includes('fotos') || feature === t('dashboard.progress.progress_photos')) {
        navigate('/progress-photos');
        return;
      }
    }

    // Fallback para outras funcionalidades
    toast({
      title: t('dashboard.coming_soon'),
      description: feature,
    });
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: t('dashboard.logout_error'),
        description: t('dashboard.logout_error_desc'),
        variant: "destructive",
      });
    } else {
      toast({
        title: t('dashboard.logout_success'),
        description: t('dashboard.logout_success_desc'),
      });
      navigate('/');
    }
  };

  // ----- FETCH CHART DATA -----
  const fetchChartData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const userId = session.user.id;

    // 1. Weight logs (últimos 30 dias)
    const since30 = new Date();
    since30.setDate(since30.getDate() - 29);

    const { data: weightLogs } = await supabase
      .from('weight_logs')
      .select('weight_kg, logged_at')
      .eq('user_id', userId)
      .gte('logged_at', since30.toISOString())
      .order('logged_at');

    const weightData: WeightDatum[] = (weightLogs || []).map(w => ({
      date: w.logged_at.split('T')[0],
      weight: w.weight_kg,
    }));

    // 2. Workout logs (últimos 7 dias)
    const since7 = new Date();
    since7.setDate(since7.getDate() - 6);

    const { data: workoutLogs } = await supabase
      .from('workout_logs')
      .select('duration_minutes, logged_at')
      .eq('user_id', userId)
      .gte('logged_at', since7.toISOString());

    const activityMap: Record<string, { workouts: number; duration: number }> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      activityMap[key] = { workouts: 0, duration: 0 };
    }
    (workoutLogs || []).forEach(l => {
      const dayKey = new Date(l.logged_at).toLocaleDateString('pt-BR', { weekday: 'short' });
      if (!activityMap[dayKey]) activityMap[dayKey] = { workouts: 0, duration: 0 };
      activityMap[dayKey].workouts += 1;
      activityMap[dayKey].duration += l.duration_minutes || 0;
    });
    const activityData: ActivityDatum[] = Object.entries(activityMap)
      .map(([day, v]) => ({ day, workouts: v.workouts, duration: v.duration }))
      .reverse();

    // 3. Nutrition (últimos 7 dias) via view meal_nutrition
    const { data: nutritionRows } = await supabase
      .from('meal_nutrition')
      .select('total_calories, total_protein, total_carbs, total_fats, meal_date')
      .eq('user_id', userId)
      .gte('meal_date', since7.toISOString().split('T')[0])
      .order('meal_date');

    const dailyNutritionData: DailyNutritionDatum[] = [];
    const nutritionMap: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {};
    
    // Inicializar com os últimos 7 dias
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dayKey = date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
      const isoDate = date.toISOString().split('T')[0];
      nutritionMap[isoDate] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    
    if (nutritionRows) {
      // Agregar dados por data real das refeições
      nutritionRows.forEach(r => {
        const mealDate = r.meal_date;
        if (mealDate && nutritionMap[mealDate]) {
          nutritionMap[mealDate].calories += r.total_calories || 0;
          nutritionMap[mealDate].protein += r.total_protein || 0;
          nutritionMap[mealDate].carbs += r.total_carbs || 0;
          nutritionMap[mealDate].fat += r.total_fats || 0;
        }
      });
    }

    // Converter para array com formato correto de data
    Object.entries(nutritionMap).forEach(([isoDate, data]) => {
      const date = new Date(isoDate);
      dailyNutritionData.push({
        date: date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
      });
    });

    // macros para hoje (pie chart)
    const todayData = dailyNutritionData[dailyNutritionData.length - 1];
    const nutritionMacros: MacroDatum[] = todayData ? [
      { name: 'Proteínas', value: todayData.protein, color: '#3b82f6' },
      { name: 'Carboidratos', value: todayData.carbs, color: '#10b981' },
      { name: 'Gorduras', value: todayData.fat, color: '#f59e0b' },
    ] : [];

    // 4. Achievements e stats do usuário
    const { achievements, stats } = await getUserAchievements(userId);

    setChartData({
      weightData,
      activityData,
      nutritionMacros,
      dailyNutritionData,
      achievements,
      userStats: stats,
      currentWeight: userProfile?.weight || 0,
      targetWeight: userProfile?.target_weight || 0,
      goal: (userProfile?.goal as 'lose_weight' | 'maintain_weight' | 'gain_muscle') || 'lose_weight',
    });
  }, [userProfile]);

  useEffect(() => {
    if (userProfile) {
      fetchChartData();
    }
  }, [userProfile, fetchChartData]);

  // Helper functions (moved after hooks)
  const getWelcomeMessage = () => {
    // Obter horário atual no timezone de São Paulo
    const now = new Date();
    const saoPauloTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    const hour = saoPauloTime.getHours();
    
    // Determinar saudação baseada no horário
    let greeting = "";
    if (hour >= 5 && hour < 12) {
      greeting = "Bom dia";
    } else if (hour >= 12 && hour < 18) {
      greeting = "Boa tarde";
    } else {
      greeting = "Boa noite";
    }
    
    return greeting;
  };

  const getGoalText = () => {
    const goal = userProfile?.goal;
    if (!goal) return t('dashboard.not_defined');
    
    const goalMap: Record<string, string> = {
      'lose_weight': t('dashboard.goals.lose_weight'),
      'maintain_weight': t('dashboard.goals.maintain_weight'),
      'gain_muscle': t('dashboard.goals.gain_muscle'),
    };
    
    return goalMap[goal] || goal;
  };

  const getActivityLevelText = () => {
    const level = userProfile?.activity_level;
    if (!level) return t('dashboard.not_informed');
    
    const levelMap: Record<string, string> = {
      'sedentary': t('dashboard.activity_levels.sedentary'),
      'lightly_active': t('dashboard.activity_levels.lightly_active'),
      'moderately_active': t('dashboard.activity_levels.moderately_active'),
      'very_active': t('dashboard.activity_levels.very_active'),
      'extremely_active': t('dashboard.activity_levels.extremely_active'),
    };
    
    return levelMap[level] || level;
  };

  // Early return after all hooks
  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 health-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Apple className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-secondary-dark">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'Nutri';
  const bmi = calculateBMI();
  const bmiData = getBMICategory(bmi);
  const progressPercentage = getProgressPercentage();

  // Se ainda não há dados, mostrar vazio para evitar erros nos gráficos
  const sampleData = chartData;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20 md:pb-0">
        {/* Desktop Header - Hidden on Mobile */}
        <div className="hidden md:block container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-800/20 shadow-health p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 lg:w-16 lg:h-16 health-gradient rounded-2xl flex items-center justify-center shadow-lg">
                  <Apple className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-primary-dark">
                    {welcomeMessage || "Olá"} 💪
                  </h1>
                  <p className="text-secondary-dark mt-1">
                    {t('dashboard.ready_evolution')}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="health-gradient text-white border-0">
                      Plano Atual - {currentPlan}
                    </Badge>
                    {subscription?.subscribed && (
                      <Badge variant="outline" className="border-health-200 text-health-700">
                        <Heart className="w-3 h-3 mr-1" />
                        {t('dashboard.active')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                {!subscription?.subscribed && (
                  <Button 
                    onClick={() => setShowPricing(true)}
                    className="health-gradient shadow-health hover:shadow-lg transition-all flex-1 sm:w-auto text-sm sm:text-base px-2 sm:px-4"
                    size="sm"
                  >
                    <Zap className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Assinatura</span>
                    <span className="inline sm:hidden">Up</span>
                  </Button>
                )}
                <Button 
                  onClick={() => navigate('/settings')}
                  variant="outline"
                  className="border-health-200 hover:bg-health-50 flex-1 sm:w-auto text-sm sm:text-base px-2 sm:px-4"
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{t('dashboard.settings')}</span>
                  <span className="inline sm:hidden">Config</span>
                </Button>
                <ThemeToggle />
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 flex-1 sm:w-auto text-sm sm:text-base px-2 sm:px-4"
                  size="sm"
                >
                  <LogOut className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{t('dashboard.logout')}</span>
                  <span className="inline sm:hidden">Sair</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-health-200/50 dark:border-slate-700/50 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 health-gradient rounded-xl flex items-center justify-center shadow-lg">
                  <Apple className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-primary-dark">
                    {welcomeMessage || "Olá"}
                  </h1>
                  <div className="flex items-center gap-2">
                    <Badge className="health-gradient text-white border-0 text-xs">
                      Plano Atual - {currentPlan}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!subscription?.subscribed && (
                  <Button 
                    onClick={() => setShowPricing(true)}
                    size="sm"
                    className="health-gradient shadow-health h-8 px-3 text-xs"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Assinatura
                  </Button>
                )}
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-4 md:py-6 max-w-7xl space-y-6">
          {/* Mobile/Tablet: MyFitnessPal Style Layout */}
          <div className="md:hidden space-y-6">
            {/* Daily Metrics Grid */}
            <MetricsGrid
              metrics={{
                calories: { 
                  current: Math.round(sampleData.nutritionMacros.reduce((acc, macro) => acc + (macro.value || 0), 0) * 4) || 1250, 
                  target: 2000 
                },
                protein: { 
                  current: Math.round(sampleData.nutritionMacros.find(m => m.name === 'Proteínas')?.value || 65), 
                  target: 150 
                },
                carbs: { 
                  current: Math.round(sampleData.nutritionMacros.find(m => m.name === 'Carboidratos')?.value || 140), 
                  target: 250 
                },
                fat: { 
                  current: Math.round(sampleData.nutritionMacros.find(m => m.name === 'Gorduras')?.value || 45), 
                  target: 65 
                },
                water: { current: 1.2, target: 2.5 },
                steps: { current: 6500, target: 10000 }
              }}
              onAddMeal={() => navigate('/create-meal')}
              onQuickLog={(type) => {
                toast({
                  title: "Registro Rápido",
                  description: `Registrando ${type}...`,
                });
              }}
            />

            {/* Charts Carousel */}
            <ChartsCarousel
              items={[
                {
                  id: 'weight',
                  title: '⚖️ Progresso de Peso',
                  content: (
                    <div className="h-64">
                      <WeightProgressChart 
                        data={sampleData.weightData} 
                        currentWeight={sampleData.currentWeight}
                        targetWeight={sampleData.targetWeight}
                        goal={sampleData.goal}
                      />
                    </div>
                  )
                },
                {
                  id: 'activity',
                  title: '🏋️ Atividade Física',
                  content: (
                    <div className="h-64">
                      <ActivityChart 
                        data={sampleData.activityData} 
                        weeklyGoal={5}
                      />
                    </div>
                  )
                },
                {
                  id: 'nutrition',
                  title: '🍎 Distribuição Nutricional',
                  content: (
                    <div className="h-64">
                      <NutritionChart 
                        macros={sampleData.nutritionMacros}
                        dailyData={sampleData.dailyNutritionData}
                        targets={{
                          calories: 2000,
                          protein: 150,
                          carbs: 250,
                          fat: 65,
                        }}
                      />
                    </div>
                  )
                },
                {
                  id: 'achievements',
                  title: '🏆 Conquistas',
                  content: (
                    <div className="h-64">
                      <AchievementsCard 
                        achievements={sampleData.achievements}
                        totalPoints={sampleData.userStats?.total_points || 0}
                        level={sampleData.userStats?.current_level || 1}
                      />
                    </div>
                  )
                }
              ]}
            />

            {/* Quick Actions Card */}
            <Card className="glass-effect border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-primary-dark">
                  🚀 Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-12 flex-col gap-1"
                    onClick={() => navigate('/create-meal')}
                  >
                    <ChefHat className="w-5 h-5" />
                    <span className="text-xs">Nova Refeição</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 flex-col gap-1"
                    onClick={() => navigate('/create-workout-plan')}
                  >
                    <Dumbbell className="w-5 h-5" />
                    <span className="text-xs">Treino</span>
                  </Button>
                </div>
                <Button
                  className="w-full health-gradient shadow-health"
                  onClick={() => navigate('/detailed-reports')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Ver Relatórios Completos
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            <div className="space-y-8">
              {/* Basic Metrics for Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass-effect">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">BMI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{bmi.toFixed(1)}</div>
                  </CardContent>
                </Card>
                
                <Card className="glass-effect">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Progresso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{progressPercentage.toFixed(0)}%</div>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Atividade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-bold">{getActivityLevelText()}</div>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Meta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-bold">{getGoalText()}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts for Desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WeightProgressChart
                  data={sampleData.weightData}
                  currentWeight={sampleData.currentWeight}
                  targetWeight={sampleData.targetWeight}
                  goal={sampleData.goal}
                />
                
                <ActivityChart
                  data={sampleData.activityData}
                  weeklyGoal={5}
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NutritionChart
                  macros={sampleData.nutritionMacros}
                  dailyData={sampleData.dailyNutritionData}
                  targets={{
                    calories: 2000,
                    protein: 150,
                    carbs: 250,
                    fat: 65,
                  }}
                />
                
                <AchievementsCard
                  achievements={sampleData.achievements || []}
                  totalPoints={sampleData.userStats?.total_points || 0}
                  level={sampleData.userStats?.current_level || 1}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Modal */}
        {showPricing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-primary-dark">
                    Escolha seu Plano
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowPricing(false)}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
                <PricingPlans plans={plans} onPlanSelect={() => {
                  setShowPricing(false);
                  refetchSubscription();
                }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation - Only show on Dashboard related pages */}
      <MobileNavigation />
    </>
  );
};

export default Dashboard;