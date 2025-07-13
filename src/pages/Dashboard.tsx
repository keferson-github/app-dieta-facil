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
  Clock,
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
import type { Tables } from "@/integrations/supabase/types";

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
    achievements: Tables<"achievements">[];
    currentWeight: number;
    targetWeight: number;
    goal: 'lose_weight' | 'maintain_weight' | 'gain_muscle';
  }>({
    weightData: [],
    activityData: [],
    nutritionMacros: [],
    dailyNutritionData: [],
    achievements: [],
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

    // Implementar navegação para a funcionalidade
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
      .select('total_calories, total_protein, total_carbs, total_fats, day_of_week')
      .eq('user_id', userId)
      .gte('day_of_week', since7.getDay());

    const dailyNutritionData: DailyNutritionDatum[] = [];
    if (nutritionRows) {
      // aggregate by day_of_week (0-6)
      const today = new Date();
      nutritionRows.forEach(r => {
        const date = new Date();
        const diff = today.getDay() - (r.day_of_week ?? 0);
        const d = new Date();
        d.setDate(today.getDate() - diff);
        dailyNutritionData.push({
          date: d.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
          calories: r.total_calories || 0,
          protein: r.total_protein || 0,
          carbs: r.total_carbs || 0,
          fat: r.total_fats || 0,
        });
      });
    }

    // macros para hoje (pie chart)
    const todayData = dailyNutritionData[dailyNutritionData.length - 1];
    const nutritionMacros: MacroDatum[] = todayData ? [
      { name: 'Proteínas', value: todayData.protein, color: '#3b82f6' },
      { name: 'Carboidratos', value: todayData.carbs, color: '#10b981' },
      { name: 'Gorduras', value: todayData.fat, color: '#f59e0b' },
    ] : [];

    // 4. Achievements do usuário
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id, awarded_at, achievements(*)')
      .eq('user_id', userId);

    const achievements = (userAchievements || []).map(ua => ua.achievements);

    setChartData({
      weightData,
      activityData,
      nutritionMacros,
      dailyNutritionData,
      achievements,
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
    return userProfile?.gender === 'male' 
      ? t('dashboard.welcome_champion') 
      : t('dashboard.welcome_champion_female');
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
      <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 health-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Apple className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">{t('dashboard.loading')}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        {/* Header Moderno */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-health p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 lg:w-16 lg:h-16 health-gradient rounded-2xl flex items-center justify-center shadow-lg">
                <Apple className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
          <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {getWelcomeMessage()} 💪
            </h1>
                <p className="text-gray-600 mt-1">
                  {t('dashboard.ready_evolution')}
            </p>
              <div className="flex items-center gap-2 mt-2">
                  <Badge className="health-gradient text-white border-0">
                    {t('dashboard.plan')} {currentPlan}
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
                  <span className="hidden sm:inline">{t('dashboard.upgrade')}</span>
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

        {showPricing ? (
          <div className="space-y-6">
            <Card className="glass-effect shadow-health">
              <CardHeader className="text-center">
                <Button 
                  onClick={() => setShowPricing(false)}
                  variant="ghost"
                  className="mb-4 mx-auto"
                >
                  ← Voltar ao Dashboard
                </Button>
                <CardTitle className="text-3xl font-bold">🚀 Potencialize seus resultados</CardTitle>
                <CardDescription className="text-lg">
                  Escolha o plano ideal para seus objetivos fitness
                </CardDescription>
              </CardHeader>
            </Card>
            <PricingPlans 
              plans={plans} 
              currentPlan={subscription?.plan}
              onPlanSelect={() => {
                refetchSubscription();
                setShowPricing(false);
              }}
            />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Cards de Estatísticas Modernos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Peso Atual */}
              <Card className="glass-effect hover:shadow-health transition-all duration-300 cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{t('dashboard.current_weight')}</CardTitle>
                  <div className="w-10 h-10 bg-health-100 rounded-xl flex items-center justify-center group-hover:bg-health-200 transition-colors">
                    <TrendingUp className="h-5 w-5 text-health-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{userProfile?.weight || 0}<span className="text-lg text-gray-500 ml-1">kg</span></div>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('dashboard.target')}: {userProfile?.target_weight || 0} kg
                  </p>
                  <Progress value={progressPercentage} className="mt-3 h-2" />
                </CardContent>
              </Card>

              {/* IMC */}
              <Card className="glass-effect hover:shadow-health transition-all duration-300 cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{t('dashboard.bmi')}</CardTitle>
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{bmi.toFixed(1)}</div>
                  <p className={`text-sm font-medium mt-1 ${bmiData.color}`}>
                    {bmiData.category}
                  </p>
                </CardContent>
              </Card>

              {/* Objetivo */}
              <Card className="glass-effect hover:shadow-health transition-all duration-300 cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{t('dashboard.goal')}</CardTitle>
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-gray-900 capitalize">{getGoalText()}</div>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('dashboard.main_goal')}
                  </p>
                </CardContent>
              </Card>

              {/* Atividade */}
              <Card className="glass-effect hover:shadow-health transition-all duration-300 cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{t('dashboard.activity')}</CardTitle>
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <Activity className="h-5 w-5 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-gray-900 capitalize">{getActivityLevelText()}</div>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('dashboard.current_level')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Seções de Recursos por Plano */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Alimentação - Plano Nutri */}
              <Card className="glass-effect shadow-health hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <ChefHat className="h-6 w-6 text-white" />
            </div>
                    <div>
                      <h3 className="text-xl font-bold">{t('dashboard.nutrition.title')}</h3>
                      <Badge variant="outline" className="mt-1 border-red-200 text-red-700">
                        {t('dashboard.plan')} Nutri
                      </Badge>
          </div>
                  </CardTitle>
                  <CardDescription>
                    {t('dashboard.nutrition.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Button 
                      onClick={() => handleFeatureClick(t('dashboard.nutrition.create_meal'), 'Nutri')}
                      className="w-full justify-between group hover:bg-red-50"
                      variant="outline"
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        {t('dashboard.nutrition.create_meal')}
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                    <Button 
                      onClick={() => handleFeatureClick(t('dashboard.nutrition.weekly_menu'), 'Nutri')}
                      className="w-full justify-between group hover:bg-red-50"
                      variant="outline"
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {t('dashboard.nutrition.weekly_menu')}
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600 font-medium mb-2">{t('dashboard.nutrition.included_features')}</p>
                      <div className="space-y-1">
                        {getPlanFeatures('Plano Nutri').map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-health-500 rounded-full"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Exercícios - Plano Energia */}
              <Card className="glass-effect shadow-health hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Dumbbell className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{t('dashboard.exercises.title')}</h3>
                      <Badge variant="outline" className="mt-1 border-blue-200 text-blue-700">
                        {t('dashboard.plan')} Energia
                      </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {t('dashboard.exercises.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Button 
                      onClick={() => handleFeatureClick(t('dashboard.exercises.start_workout'), 'Energia')}
                      className="w-full justify-between group hover:bg-blue-50"
                      variant="outline"
                    >
                      <span className="flex items-center gap-2">
                        {currentPlan === 'Nutri' ? <Lock className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                        {t('dashboard.exercises.start_workout')}
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button 
                      onClick={() => handleFeatureClick(t('dashboard.exercises.workout_sheet'), 'Energia')}
                      className="w-full justify-between group hover:bg-blue-50"
                      variant="outline"
                    >
                      <span className="flex items-center gap-2">
                        {currentPlan === 'Nutri' ? <Lock className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                        {t('dashboard.exercises.workout_sheet')}
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600 font-medium mb-2">{t('dashboard.nutrition.included_features')}</p>
                      <div className="space-y-1">
                        {getPlanFeatures('Plano Energia').map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-health-500 rounded-full"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progresso - Plano Performance */}
            <Card className="glass-effect shadow-health hover:shadow-lg transition-all duration-300 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{t('dashboard.progress.title')}</h3>
                    <Badge variant="outline" className="mt-1 border-purple-200 text-purple-700">
                      {t('dashboard.plan')} Performance
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription>
                  {t('dashboard.progress.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Button 
                    onClick={() => handleFeatureClick(t('dashboard.progress.detailed_reports'), 'Performance')}
                    className="justify-between group hover:bg-purple-50"
                    variant="outline"
                  >
                    <span className="flex items-center gap-2">
                      {['Nutri', 'Energia'].includes(currentPlan) ? <Lock className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
                      {t('dashboard.progress.detailed_reports')}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    onClick={() => handleFeatureClick(t('dashboard.progress.body_measurements'), 'Performance')}
                    className="justify-between group hover:bg-purple-50"
                    variant="outline"
                  >
                    <span className="flex items-center gap-2">
                      {['Nutri', 'Energia'].includes(currentPlan) ? <Lock className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                      {t('dashboard.progress.body_measurements')}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    onClick={() => handleFeatureClick(t('dashboard.progress.progress_photos'), 'Performance')}
                    className="justify-between group hover:bg-purple-50"
                    variant="outline"
                  >
                    <span className="flex items-center gap-2">
                      {['Nutri', 'Energia'].includes(currentPlan) ? <Lock className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                      {t('dashboard.progress.progress_photos')}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-sm text-gray-600 font-medium mb-2">{t('dashboard.nutrition.included_features')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {getPlanFeatures('Plano Performance').map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-health-500 rounded-full"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seção de Gráficos e Analytics */}
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Seus Dados e Progresso</h2>
                <p className="text-gray-600">Acompanhe sua evolução com gráficos detalhados</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Evolução do Peso */}
                <WeightProgressChart
                  data={sampleData.weightData}
                  currentWeight={sampleData.currentWeight}
                  targetWeight={sampleData.targetWeight}
                  goal={sampleData.goal}
                />
                
                {/* Gráfico de Atividade Semanal */}
                <ActivityChart
                  data={sampleData.activityData}
                  weeklyGoal={5}
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Nutrição */}
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
                
                {/* Card de Conquistas */}
                <AchievementsCard
                  achievements={(sampleData.achievements || []).map((a: Tables<"achievements">) => {
                    const category: 'weight' | 'exercise' | 'nutrition' | 'streak' = 
                      a.code?.startsWith('first_meal') || a.code?.includes('nutrition') ? 'nutrition' :
                      a.code?.includes('workout') ? 'exercise' :
                      a.code?.includes('weight') ? 'weight' : 'streak';
                    return {
                      id: a.id,
                      title: a.title,
                      description: a.description || '',
                      icon: a.icon || '🏆',
                      achieved: true,
                      category
                    };
                  })}
                  totalPoints={750}
                  level={3}
                />
              </div>
            </div>

            {/* Call to Action para Upgrade */}
            {currentPlan === 'Nutri' && (
              <Card className="glass-effect shadow-health border-2 border-health-200 bg-gradient-to-r from-health-50 to-green-50">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 health-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('dashboard.cta_upgrade.title')}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {t('dashboard.cta_upgrade.description')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => setShowPricing(true)}
                      className="health-gradient shadow-health hover:shadow-lg transition-all"
                      size="lg"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      {t('dashboard.cta_upgrade.button')}
                    </Button>
                    <Button variant="outline" className="border-health-200">
                      <Clock className="w-4 h-4 mr-2" />
                      {t('dashboard.cta_upgrade.trial')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;