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
  LogOut,
  Check,
  PieChart,
  BarChart
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
import MacroNutrientsCarousel from "@/components/MacroNutrientsCarousel";
import { useDashboardData } from "@/hooks/useDashboardData";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const [userProfile, setUserProfile] = useState<Tables<"user_profiles"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState("");

  // Hook para dados reais do dashboard
  const { 
    metrics, 
    weeklySteps, 
    loading: dashboardLoading, 
    error: dashboardError,
    logWaterIntake,
    logDailySteps,
    updateActivitySummary,
    refetch: refetchDashboard
  } = useDashboardData();

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

  // Helper functions (moved after hooks)
  const getWelcomeMessage = useCallback(() => {
    // Obter horário atual no timezone de São Paulo
    const now = new Date();
    const saoPauloTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    const hour = saoPauloTime.getHours();
    
    // Determinar saudação baseada no horário
    let greeting = "";
    if (hour >= 5 && hour < 12) {
      greeting = t('dashboard.greetings.good_morning');
    } else if (hour >= 12 && hour < 18) {
      greeting = t('dashboard.greetings.good_afternoon');
    } else {
      greeting = t('dashboard.greetings.good_evening');
    }
    
    return greeting;
  }, [t]);

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
          title: t('notifications.dashboard.error'),
          description: t('notifications.dashboard.error_profile'),
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
        title: t('notifications.dashboard.error'),
        description: t('notifications.dashboard.error_unexpected'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [navigate, toast, t]);

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
  }, [getWelcomeMessage]);

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

  const getActivityLevelText = useCallback(() => {
    const level = userProfile?.activity_level;
    if (!level) return null; // Retorna null se não houver dados
    
    const levelMap: Record<string, string> = {
      'sedentary': t('dashboard.activity_levels.sedentary'),
      'lightly_active': t('dashboard.activity_levels.lightly_active'),
      'moderately_active': t('dashboard.activity_levels.moderately_active'),
      'very_active': t('dashboard.activity_levels.very_active'),
      'extremely_active': t('dashboard.activity_levels.extremely_active'),
    };
    
    return levelMap[level] || level;
  }, [userProfile?.activity_level, t]);

  const calculateBMI = () => {
    if (metrics?.bmi) return metrics.bmi;
    if (!userProfile?.weight || !userProfile?.height) return null; // Retorna null se não houver dados
    return (userProfile.weight / Math.pow(userProfile.height / 100, 2));
  };

  const getBMICategory = (bmi: number) => {
    if (metrics?.bmi_category && metrics.bmi_category !== 'unknown') {
      const categoryMap: Record<string, { category: string, color: string }> = {
        'underweight': { category: t('dashboard.bmi_categories.underweight'), color: 'text-blue-600' },
        'normal': { category: t('dashboard.bmi_categories.normal'), color: 'text-health-600' },
        'overweight': { category: t('dashboard.bmi_categories.overweight'), color: 'text-yellow-600' },
        'obese': { category: t('dashboard.bmi_categories.obese'), color: 'text-red-600' }
      };
      return categoryMap[metrics.bmi_category] || { category: 'Normal', color: 'text-health-600' };
    }
    
    // Fallback para cálculo manual do BMI
    if (bmi < 18.5) return { category: t('dashboard.bmi_categories.underweight'), color: 'text-blue-600' };
    if (bmi < 25) return { category: t('dashboard.bmi_categories.normal'), color: 'text-health-600' };
    if (bmi < 30) return { category: t('dashboard.bmi_categories.overweight'), color: 'text-yellow-600' };
    return { category: t('dashboard.bmi_categories.obese'), color: 'text-red-600' };
  };

  const getProgressPercentage = () => {
    if (metrics?.progress_percentage) return metrics.progress_percentage;
    if (!userProfile?.weight || !userProfile?.target_weight) return null; // Retorna null se não houver dados
    const initialWeight = userProfile.weight + 10; // Assumindo que começou 10kg acima do atual
    const progress = ((initialWeight - userProfile.weight) / (initialWeight - userProfile.target_weight)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  // Função para obter dados reais do dashboard
  const getRealData = () => {
    return {
      calories: { 
        current: 0, // TODO: Calcular calorias reais dos logs de refeições
        target: metrics?.calories_target || 2000
      },
      protein: { 
        current: 0, // TODO: Calcular proteínas reais dos logs de refeições
        target: metrics?.protein_target || 150
      },
      carbs: { 
        current: 0, // TODO: Calcular carboidratos reais dos logs de refeições
        target: metrics?.carbs_target || 250
      },
      fat: { 
        current: 0, // TODO: Calcular gorduras reais dos logs de refeições
        target: metrics?.fat_target || 67
      },
      water: { 
        current: metrics?.today_water_ml ? metrics.today_water_ml / 1000 : 0,
        target: metrics?.water_target_ml ? metrics.water_target_ml / 1000 : 2.5
      },
      steps: { 
        current: metrics?.today_steps || 0,
        target: metrics?.steps_target || 10000
      },
      weight: { 
        current: metrics?.current_weight || userProfile?.weight || 0,
        target: metrics?.target_weight || userProfile?.target_weight || 70
      },
      activityDays: { 
        active: metrics?.week_active_days || 0,
        total: 7 
      },
      weeklyActivityHeights: weeklySteps.length > 0 
        ? weeklySteps.slice(0, 7).reverse().map(step => 
            Math.min((step.completion_percentage || 0), 100)
          ).concat(Array(7 - Math.min(weeklySteps.length, 7)).fill(0))
        : Array(7).fill(0) // Array vazio para 7 dias se não houver dados
    };
  };

  // Handlers para ações com dados reais
  const handleWaterLog = async (amount: number) => {
    try {
      await logWaterIntake(amount);
      await updateActivitySummary({ water_logged: true });
      toast({
        title: t('notifications.dashboard.water_logged'),
        description: t('notifications.dashboard.water_logged_desc', { amount }),
      });
    } catch (error) {
      toast({
        title: t('notifications.dashboard.error'),
        description: t('notifications.dashboard.error_water'),
        variant: "destructive",
      });
    }
  };

  const handleStepsLog = async (steps: number) => {
    try {
      await logDailySteps(steps);
      await updateActivitySummary({ steps_recorded: true });
      toast({
        title: t('notifications.dashboard.steps_logged'),
        description: t('notifications.dashboard.steps_logged_desc', { steps }),
      });
    } catch (error) {
      toast({
        title: t('notifications.dashboard.error'),
        description: t('notifications.dashboard.error_steps'),
        variant: "destructive",
      });
    }
  };

  const handleMealLog = async () => {
    try {
      await updateActivitySummary({ 
        meals_logged: (metrics?.today_meals_count || 0) + 1 
      });
      toast({
        title: t('notifications.dashboard.meal_logged'),
        description: t('notifications.dashboard.meal_logged_desc'),
      });
    } catch (error) {
      toast({
        title: t('notifications.dashboard.error'),
        description: t('notifications.dashboard.error_meal'),
        variant: "destructive",
      });
    }
  };

  const handleWorkoutLog = async () => {
    try {
      await updateActivitySummary({ 
        workouts_completed: (metrics?.today_workouts_count || 0) + 1 
      });
      toast({
        title: t('notifications.dashboard.workout_logged'),
        description: t('notifications.dashboard.workout_logged_desc'),
      });
    } catch (error) {
      toast({
        title: t('notifications.dashboard.error'),
        description: t('notifications.dashboard.error_workout'),
        variant: "destructive",
      });
    }
  };

  const handleFeatureClick = (feature: string, requiredPlan: string) => {
    // Liberar recursos do Plano Nutri gratuitamente
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
        title: t('notifications.dashboard.feature_available'),
        description: t('notifications.dashboard.feature_available_desc', { feature }),
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

  const getGoalText = useCallback(() => {
    const goal = userProfile?.goal;
    if (!goal) return null; // Retorna null se não houver dados
    
    const goalMap: Record<string, string> = {
      'lose_weight': t('dashboard.goals.lose_weight'),
      'maintain_weight': t('dashboard.goals.maintain_weight'),
      'gain_muscle': t('dashboard.goals.gain_muscle'),
    };
    
    return goalMap[goal] || goal;
  }, [userProfile?.goal, t]);

  // Early return after all hooks
  if (loading || subscriptionLoading || dashboardLoading) {
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
  const realData = getRealData();

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
                    {welcomeMessage || t('dashboard.hello')} 💪
                  </h1>
                  <p className="text-secondary-dark mt-1">
                    {t('dashboard.ready_evolution')}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="health-gradient text-white border-0">
                      {t('dashboard.current_plan')} - {currentPlan}
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
                    <span className="hidden sm:inline">{t('dashboard.subscription')}</span>
                    <span className="inline sm:hidden">{t('dashboard.subscription_short')}</span>
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
                  <span className="inline sm:hidden">{t('dashboard.settings_short')}</span>
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
                  <span className="inline sm:hidden">{t('dashboard.logout_short')}</span>
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
                    {welcomeMessage || t('dashboard.hello')}
                  </h1>
                  <div className="flex items-center gap-2">
                    <Badge className="health-gradient text-white border-0 text-xs">
                      {t('dashboard.current_plan')} - {currentPlan}
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
                    {t('dashboard.subscription')}
                  </Button>
                )}
                <LanguageSwitcher fixed={false} />
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
                  current: realData.calories.current, 
                  target: realData.calories.target 
                },
                protein: { 
                  current: realData.protein.current,
                  target: realData.protein.target 
                },
                carbs: { 
                  current: realData.carbs.current,
                  target: realData.carbs.target 
                },
                fat: { 
                  current: realData.fat.current,
                  target: realData.fat.target 
                },
                water: realData.water,
                steps: realData.steps
              }}
              onAddMeal={() => navigate('/create-meal')}
              onQuickLog={(type) => {
                if (type === 'water') {
                  handleWaterLog(250);
                } else {
                  toast({
                    title: "Registro Rápido",
                    description: `Registrando ${type}...`,
                  });
                }
              }}
            />

            {/* Macro Nutrients Carousel (Pie Charts) */}
            <MacroNutrientsCarousel
              macros={{
                protein: { 
                  current: realData.protein.current,
                  target: realData.protein.target 
                },
                carbs: { 
                  current: realData.carbs.current,
                  target: realData.carbs.target 
                },
                fat: { 
                  current: realData.fat.current,
                  target: realData.fat.target 
                }
              }}
            />

            {/* Charts Section - Static Layout */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-primary-dark mb-2">
                  📊 Seus Dados e Progresso
                </h3>
                <p className="text-sm text-secondary-dark">
                  Acompanhe sua evolução com gráficos detalhados
                </p>
              </div>

              {/* Weight Progress Chart */}
              <WeightProgressChart 
                data={chartData.weightData} 
                currentWeight={chartData.currentWeight}
                targetWeight={chartData.targetWeight}
                goal={chartData.goal}
              />

              {/* Activity Chart */}
              <ActivityChart 
                data={chartData.activityData} 
                weeklyGoal={5}
              />

              {/* Nutrition Chart */}
              <NutritionChart 
                macros={chartData.nutritionMacros}
                dailyData={chartData.dailyNutritionData}
                targets={{
                  calories: realData.calories.target,
                  protein: realData.protein.target,
                  carbs: realData.carbs.target,
                  fat: realData.fat.target
                }}
              />

              {/* Achievements Card */}
              <AchievementsCard 
                achievements={chartData.achievements}
                totalPoints={chartData.userStats?.total_points || 0}
                level={chartData.userStats?.current_level || 1}
              />
            </div>

            {/* Quick Actions Card */}
            <Card className="glass-effect shadow-sm border border-health-200/50 dark:border-health-700/50" style={{borderImage: 'linear-gradient(135deg, #22c55e, #3b82f6, #a855f7) 1'}}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-primary-dark">
                  🚀 Ações Rápidas
                </CardTitle>
                <CardDescription className="text-sm text-secondary-dark">
                  Adicione dados ou comece um treino
                </CardDescription>
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
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-10 flex items-center gap-1"
                    onClick={() => handleWaterLog(250)}
                  >
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs">+250ml</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 flex items-center gap-1"
                    onClick={() => {
                      toast({
                        title: "Registro de Peso",
                        description: "Abrindo formulário...",
                      });
                    }}
                  >
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-xs">Peso</span>
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

            {/* Premium Plans Promotion - Only show for non-subscribers */}
            {!subscription?.subscribed && (
              <Card className="glass-effect shadow-sm bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200/50 dark:border-purple-700/50" style={{borderImage: 'linear-gradient(135deg, #3b82f6, #a855f7, #06b6d4) 1'}}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-primary-dark flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-500" />
                    ⚡ Planos Premium
                  </CardTitle>
                  <CardDescription className="text-sm text-secondary-dark">
                    Desbloqueie todo o potencial da sua jornada fitness
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Plano Energia Preview */}
                  <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg p-3 border border-blue-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Plano Energia
                      </h4>
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs">
                        Popular
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Nutrição + Treinos personalizados
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <div>✓ Fichas de treino completas</div>
                      <div>✓ Exercícios para casa e academia</div>
                    </div>
                  </div>

                  {/* Plano Performance Preview */}
                  <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg p-3 border border-purple-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Plano Performance
                      </h4>
                      <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-xs">
                        Completo
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Acompanhamento completo + relatórios avançados
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <div>✓ Tudo do Plano Energia</div>
                      <div>✓ Relatórios detalhados de progresso</div>
                      <div>✓ Suporte prioritário</div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowPricing(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Ver Planos Premium
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="hidden md:block">
            <div className="space-y-8">
              {/* Daily Metrics Grid for Desktop */}
              <div className="block lg:hidden">
                <MetricsGrid
                  metrics={{
                    calories: { 
                      current: realData.calories.current,
                      target: realData.calories.target 
                    },
                    protein: { 
                      current: realData.protein.current, 
                      target: realData.protein.target 
                    },
                    carbs: { 
                      current: realData.carbs.current, 
                      target: realData.carbs.target 
                    },
                    fat: { 
                      current: realData.fat.current, 
                      target: realData.fat.target 
                    },
                    water: realData.water,
                    steps: realData.steps
                  }}
                  onAddMeal={() => {
                    handleMealLog();
                    navigate('/create-meal');
                  }}
                  onQuickLog={(type) => {
                    if (type === 'water') {
                      handleWaterLog(250);
                    } else {
                      toast({
                        title: "Registro Rápido",
                        description: `Registrando ${type}...`,
                      });
                    }
                  }}
                />
              </div>

              {/* Macro Nutrients Carousel for Tablet */}
              <div className="block lg:hidden">
                <MacroNutrientsCarousel
                  macros={{
                    protein: { 
                      current: realData.protein.current, 
                      target: realData.protein.target 
                    },
                    carbs: { 
                      current: realData.carbs.current, 
                      target: realData.carbs.target 
                    },
                    fat: { 
                      current: realData.fat.current, 
                      target: realData.fat.target 
                    }
                  }}
                />
              </div>

              {/* Modern Dashboard Metrics with Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* BMI Card with Donut Chart */}
                <Card className="glass-effect bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:shadow-lg transition-all duration-300 border border-health-200/50 dark:border-health-700/50" 
                      style={{boxShadow: '0 8px 32px rgba(250, 250, 250, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)', borderImage: 'linear-gradient(135deg, #22c55e, #3b82f6) 1'}}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-health-500" />
                      IMC
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-health-600 mb-1">{bmi > 0 ? bmi.toFixed(1) : '25.2'}</div>
                        <div className={`text-xs font-medium ${bmiData.color}`}>{bmiData.category || 'Normal'}</div>
                      </div>
                      <div className="relative w-16 h-16">
                        {/* SVG Donut Chart */}
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                          {/* Background circle */}
                          <circle 
                            cx="32" 
                            cy="32" 
                            r="28" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="6"
                            className="text-health-100 dark:text-health-800"
                          />
                          {/* Progress circle */}
                          <circle 
                            cx="32" 
                            cy="32" 
                            r="28" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="6" 
                            strokeLinecap="round"
                            className="text-health-500"
                            strokeDasharray={`${Math.min((bmi || 25.2) / 30, 1) * 175.93} 175.93`}
                            style={{
                              transition: 'stroke-dasharray 1s ease-out'
                            }}
                          />
                        </svg>
                        {/* Center content */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <PieChart className="w-4 h-4 text-health-500 mx-auto mb-1" />
                            <div className="text-xs font-bold text-health-600">{Math.round(Math.min((bmi || 25.2) / 30, 1) * 100)}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Progress Card with Bar Chart */}
                <Card className="glass-effect bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:shadow-lg transition-all duration-300 border border-blue-200/50 dark:border-blue-700/50" 
                      style={{boxShadow: '0 8px 32px rgba(59, 130, 246, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)', borderImage: 'linear-gradient(135deg, #3b82f6, #06b6d4) 1'}}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart className="w-4 h-4 text-blue-500" />
                      Progresso
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-blue-600">{progressPercentage > 0 ? progressPercentage.toFixed(0) : '63'}%</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                          <div className="font-medium">Meta: {realData.weight.target}kg</div>
                          <div>Atual: {realData.weight.current}kg</div>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
                          <div 
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm relative overflow-hidden" 
                            style={{width: `${Math.min(progressPercentage || 63, 100)}%`}}
                          >
                            {/* Animated shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                          </div>
                        </div>
                        {/* Progress markers */}
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-400">0%</span>
                          <span className="text-xs text-gray-400">50%</span>
                          <span className="text-xs text-gray-400">100%</span>
                        </div>
                      </div>
                      <div className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium">
                        {(progressPercentage || 63) < 100 ? `${(100 - (progressPercentage || 63)).toFixed(0)}% restante` : "Meta alcançada! 🎉"}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Card with Column Chart */}
                <Card className="glass-effect bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:shadow-lg transition-all duration-300 border border-green-200/50 dark:border-green-700/50" 
                      style={{boxShadow: '0 8px 32px rgba(34, 197, 94, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)', borderImage: 'linear-gradient(135deg, #22c55e, #10b981) 1'}}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-500" />
                      Atividade
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-green-600">{getActivityLevelText()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium">{realData.activityDays.active}/{realData.activityDays.total} dias</span>
                        </div>
                      </div>
                      <div className="flex items-end justify-between gap-1 h-16 px-1">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, i) => {
                          const heights = realData.weeklyActivityHeights;
                          const isActive = i < realData.activityDays.active;
                          return (
                            <div key={i} className="flex flex-col items-center gap-1 flex-1">
                              <div 
                                className={`w-full rounded-t transition-all duration-300 hover:scale-110 ${
                                  isActive 
                                    ? 'bg-gradient-to-t from-green-500 to-green-400 shadow-sm' 
                                    : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                                style={{
                                  height: `${heights[i]}%`,
                                  minHeight: '12px',
                                  maxWidth: '12px'
                                }}
                              ></div>
                              <div className={`text-xs font-medium ${
                                isActive ? 'text-green-600' : 'text-gray-400'
                              }`}>
                                {day.charAt(0)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                        <div className="flex items-center justify-center gap-3">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>Ativo</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                            <span>Descanso</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Goals Card with Target Chart */}
                <Card className="glass-effect bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:shadow-lg transition-all duration-300 border border-purple-200/50 dark:border-purple-700/50" 
                      style={{boxShadow: '0 8px 32px rgba(168, 85, 247, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)', borderImage: 'linear-gradient(135deg, #a855f7, #ec4899) 1'}}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-500" />
                      Meta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-purple-600">{getGoalText()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Em andamento</span>
                        </div>
                      </div>
                      {/* Circular progress for goal */}
                      <div className="flex items-center justify-center">
                        <div className="relative w-20 h-20">
                          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                            {/* Background circle */}
                            <circle 
                              cx="40" 
                              cy="40" 
                              r="32" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="6"
                              className="text-purple-100 dark:text-purple-900/50"
                            />
                            {/* Progress circle */}
                            <circle 
                              cx="40" 
                              cy="40" 
                              r="32" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="6" 
                              strokeLinecap="round"
                              className="text-purple-500"
                              strokeDasharray={`${(progressPercentage || 63) * 2.01} 201.06`}
                              style={{
                                transition: 'stroke-dasharray 1s ease-out'
                              }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <Target className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                              <div className="text-xs font-bold text-purple-600">{(progressPercentage || 63).toFixed(0)}%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span>Objetivo definido</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts for Desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WeightProgressChart
                  data={chartData.weightData}
                  currentWeight={chartData.currentWeight}
                  targetWeight={chartData.targetWeight}
                  goal={chartData.goal}
                />
                
                <ActivityChart
                  data={chartData.activityData}
                  weeklyGoal={5}
                />
              </div>
              
              {/* Additional Real Data Cards for Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Daily Calories Card */}
                <Card className="glass-effect bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:shadow-lg transition-all duration-300 border border-orange-200/50 dark:border-orange-700/50" style={{borderImage: 'linear-gradient(135deg, #f97316, #f59e0b) 1'}}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Apple className="w-4 h-4 text-orange-500" />
                      Calorias Hoje
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-orange-600">{realData.calories.current}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Meta: {realData.calories.target}</span>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                            style={{width: `${Math.min((realData.calories.current / realData.calories.target) * 100, 100)}%`}}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                        {Math.round((realData.calories.current / realData.calories.target) * 100)}% da meta diária
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Water Intake Card */}
                <Card className="glass-effect bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:shadow-lg transition-all duration-300 border border-blue-200/50 dark:border-blue-700/50" style={{borderImage: 'linear-gradient(135deg, #3b82f6, #06b6d4) 1'}}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      Hidratação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-blue-600">{realData.water.current}L</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Meta: {realData.water.target}L</span>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                            style={{width: `${Math.min((realData.water.current / realData.water.target) * 100, 100)}%`}}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                        {Math.round((realData.water.current / realData.water.target) * 100)}% hidratado
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Steps Card */}
                <Card className="glass-effect bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:shadow-lg transition-all duration-300 border border-green-200/50 dark:border-green-700/50" style={{borderImage: 'linear-gradient(135deg, #22c55e, #10b981) 1'}}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-500" />
                      Passos Hoje
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-green-600">{realData.steps.current.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Meta: {realData.steps.target.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                            style={{width: `${Math.min((realData.steps.current / realData.steps.target) * 100, 100)}%`}}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                        {Math.round((realData.steps.current / realData.steps.target) * 100)}% da meta
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Protein Card */}
                <Card className="glass-effect bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:shadow-lg transition-all duration-300 border border-red-200/50 dark:border-red-700/50" style={{borderImage: 'linear-gradient(135deg, #ef4444, #dc2626) 1'}}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      Proteínas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-red-600">{realData.protein.current}g</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Meta: {realData.protein.target}g</span>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                            style={{width: `${Math.min((realData.protein.current / realData.protein.target) * 100, 100)}%`}}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                        {Math.round((realData.protein.current / realData.protein.target) * 100)}% da meta
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Additional Mock Data Summary Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Summary Card */}
                <Card className="glass-effect bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-health-200/50 dark:border-health-700/50" style={{borderImage: 'linear-gradient(135deg, #22c55e, #3b82f6, #a855f7) 1'}}>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-primary-dark flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      📊 Resumo do Dia
                    </CardTitle>
                    <CardDescription>
                      Suas principais métricas de hoje
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{realData.calories.current}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Calorias consumidas</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{realData.steps.current.toLocaleString()}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Passos dados</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{realData.water.current}L</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Água consumida</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{metrics?.today_meals_count || 0}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Refeições registradas</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <Button 

                        onClick={() => navigate('/create-meal')}
                        className="health-gradient w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Registrar Nova Refeição
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly Streak & Goals Card */}
                <Card className="glass-effect bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-yellow-200/50 dark:border-yellow-700/50" style={{borderImage: 'linear-gradient(135deg, #f59e0b, #eab308, #facc15) 1'}}>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-primary-dark flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      🔥 Streak & Metas
                    </CardTitle>
                    <CardDescription>
                      Seu progresso semanal e sequência
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                            🔥
                          </div>
                          <div>
                            <div className="font-semibold text-yellow-700 dark:text-yellow-400">Sequência Atual</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Dias consecutivos</div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-yellow-600">{metrics?.overall_streak || 0}</div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            🎯
                          </div>
                          <div>
                            <div className="font-semibold text-green-700 dark:text-green-400">Metas Concluídas</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Desta semana</div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-green-600">{realData.activityDays.active}/{realData.activityDays.total}</div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            💪
                          </div>
                          <div>
                            <div className="font-semibold text-blue-700 dark:text-blue-400">Treinos Realizados</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Esta semana</div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">4</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <Button 
                        onClick={() => navigate('/create-workout-plan')}
                        variant="outline"
                        className="w-full border-health-200 hover:bg-health-50"
                      >
                        <Dumbbell className="w-4 h-4 mr-2" />
                        Iniciar Treino
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NutritionChart
                  macros={chartData.nutritionMacros}
                  dailyData={chartData.dailyNutritionData}
                  targets={{
                    calories: realData.calories.target,
                    protein: realData.protein.target,
                    carbs: realData.carbs.target,
                    fat: realData.fat.target
                  }}
                />
                
                <AchievementsCard
                  achievements={chartData.achievements || []}
                  totalPoints={chartData.userStats?.total_points || 0}
                  level={chartData.userStats?.current_level || 1}
                />
              </div>

              {/* Premium Plans Promotion for Desktop - Only show for non-subscribers */}
              {!subscription?.subscribed && (
                <Card className="glass-effect bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200/50 dark:border-purple-700/50" style={{borderImage: 'linear-gradient(135deg, #3b82f6, #a855f7, #06b6d4) 1'}}>
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl font-bold text-primary-dark flex items-center justify-center gap-3">
                      <Zap className="w-6 h-6 text-blue-500" />
                      ⚡ Desbloqueie Todo Seu Potencial
                    </CardTitle>
                    <CardDescription className="text-secondary-dark">
                      Escolha o plano ideal para acelerar seus resultados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      {/* Plano Energia Desktop */}
                      <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-4 border border-blue-200/50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Plano Energia
                          </h4>
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            Mais Popular
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Nutrição completa + treinos personalizados para resultados acelerados
                        </p>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            Fichas de treino completas
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            Exercícios para casa e academia
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            Cardápios personalizados
                          </div>
                        </div>
                      </div>

                      {/* Plano Performance Desktop */}
                      <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-4 border border-purple-200/50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            Plano Performance
                          </h4>
                          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                            Completo
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Acompanhamento premium com relatórios avançados e suporte prioritário
                        </p>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            Tudo do Plano Energia
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            Relatórios detalhados de progresso
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            Suporte prioritário 24/7
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <Button
                        onClick={() => setShowPricing(true)}
                        size="lg"
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg px-8"

>
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Escolher Meu Plano Premium
                      </Button>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Cancele a qualquer momento • Sem compromisso
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
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