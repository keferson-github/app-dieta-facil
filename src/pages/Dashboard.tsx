import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PricingPlans } from "@/components/PricingPlans";
import { useSubscription } from "@/hooks/useSubscription";
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
  const [userProfile, setUserProfile] = useState<Tables<"user_profiles"> | null>(null);
  const [loading, setLoading] = useState(true);
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
        title: "🎉 Bem-vindo ao time!",
        description: "Sua assinatura foi ativada com sucesso! Vamos alcançar seus objetivos juntos.",
      });
      refetchSubscription();
      window.history.replaceState({}, '', '/dashboard');
    } else if (urlParams.get('canceled') === 'true') {
      toast({
        title: "Processo cancelado",
        description: "Sem problemas! Você ainda pode continuar usando o plano gratuito.",
        variant: "destructive",
      });
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [toast, refetchSubscription]);

  const calculateBMI = () => {
    if (!userProfile?.weight || !userProfile?.height) return 0;
    return (userProfile.weight / Math.pow(userProfile.height / 100, 2));
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Abaixo do peso', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Peso normal', color: 'text-health-600' };
    if (bmi < 30) return { category: 'Sobrepeso', color: 'text-yellow-600' };
    return { category: 'Obesidade', color: 'text-red-600' };
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
        title: `🔒 Recurso Premium`,
        description: `Esta funcionalidade está disponível no plano ${requiredPlan}. Faça upgrade para acessar!`,
        variant: "destructive",
      });
      setShowPricing(true);
      return;
    }

    // Implementar navegação para a funcionalidade
    toast({
      title: "Em breve!",
      description: `A funcionalidade "${feature}" estará disponível em breve.`,
    });
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 health-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Apple className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Carregando seu painel...</p>
        </div>
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'Nutri';
  const bmi = calculateBMI();
  const bmiData = getBMICategory(bmi);
  const progressPercentage = getProgressPercentage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        {/* Header Moderno */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-health p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 health-gradient rounded-2xl flex items-center justify-center shadow-lg">
                <Apple className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Olá, {userProfile?.gender === 'male' ? 'campeão' : 'campeã'}! 💪
                </h1>
                <p className="text-gray-600 mt-1">
                  Pronto para mais um dia de evolução?
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="health-gradient text-white border-0">
                    Plano {currentPlan}
                  </Badge>
                  {subscription?.subscribed && (
                    <Badge variant="outline" className="border-health-200 text-health-700">
                      <Heart className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              {!subscription?.subscribed && (
                <Button 
                  onClick={() => setShowPricing(true)}
                  className="health-gradient shadow-health hover:shadow-lg transition-all"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade
                </Button>
              )}
              <Button 
                onClick={() => navigate('/settings')}
                variant="outline"
                className="border-health-200 hover:bg-health-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
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
                  <CardTitle className="text-sm font-medium text-gray-600">Peso Atual</CardTitle>
                  <div className="w-10 h-10 bg-health-100 rounded-xl flex items-center justify-center group-hover:bg-health-200 transition-colors">
                    <TrendingUp className="h-5 w-5 text-health-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{userProfile?.weight || 0}<span className="text-lg text-gray-500 ml-1">kg</span></div>
                  <p className="text-sm text-gray-500 mt-1">
                    Meta: {userProfile?.target_weight || 0} kg
                  </p>
                  <Progress value={progressPercentage} className="mt-3 h-2" />
                </CardContent>
              </Card>

              {/* IMC */}
              <Card className="glass-effect hover:shadow-health transition-all duration-300 cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">IMC</CardTitle>
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
                  <CardTitle className="text-sm font-medium text-gray-600">Objetivo</CardTitle>
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-gray-900 capitalize">{userProfile?.goal || 'Não definido'}</div>
                  <p className="text-sm text-gray-500 mt-1">
                    Meta principal
                  </p>
                </CardContent>
              </Card>

              {/* Atividade */}
              <Card className="glass-effect hover:shadow-health transition-all duration-300 cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Atividade</CardTitle>
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <Activity className="h-5 w-5 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-gray-900 capitalize">{userProfile?.activity_level || 'Não informado'}</div>
                  <p className="text-sm text-gray-500 mt-1">
                    Nível atual
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
                      <h3 className="text-xl font-bold">Alimentação</h3>
                      <Badge variant="outline" className="mt-1 border-red-200 text-red-700">
                        Plano Nutri
                      </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Monte refeições personalizadas para sua rotina alimentar
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Button 
                      onClick={() => handleFeatureClick('Criar Refeição', 'Nutri')}
                      className="w-full justify-between group hover:bg-red-50"
                      variant="outline"
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Criar Refeição
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button 
                      onClick={() => handleFeatureClick('Cardápio Semanal', 'Nutri')}
                      className="w-full justify-between group hover:bg-red-50"
                      variant="outline"
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Cardápio Semanal
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600 font-medium mb-2">Recursos inclusos:</p>
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
                      <h3 className="text-xl font-bold">Exercícios</h3>
                      <Badge variant="outline" className="mt-1 border-blue-200 text-blue-700">
                        Plano Energia
                      </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Crie refeições e treinos para manter o corpo ativo e saudável
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Button 
                      onClick={() => handleFeatureClick('Iniciar Treino', 'Energia')}
                      className="w-full justify-between group hover:bg-blue-50"
                      variant="outline"
                    >
                      <span className="flex items-center gap-2">
                        {currentPlan === 'Nutri' ? <Lock className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                        Iniciar Treino
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button 
                      onClick={() => handleFeatureClick('Ficha de Treino', 'Energia')}
                      className="w-full justify-between group hover:bg-blue-50"
                      variant="outline"
                    >
                      <span className="flex items-center gap-2">
                        {currentPlan === 'Nutri' ? <Lock className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                        Ficha de Treino
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600 font-medium mb-2">Recursos inclusos:</p>
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
                    <h3 className="text-xl font-bold">Acompanhamento de Progresso</h3>
                    <Badge variant="outline" className="mt-1 border-purple-200 text-purple-700">
                      Plano Performance
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription>
                  Alimentação, treinos e progresso em um só lugar. Evolua de verdade
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Button 
                    onClick={() => handleFeatureClick('Relatórios Detalhados', 'Performance')}
                    className="justify-between group hover:bg-purple-50"
                    variant="outline"
                  >
                    <span className="flex items-center gap-2">
                      {['Nutri', 'Energia'].includes(currentPlan) ? <Lock className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
                      Relatórios
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    onClick={() => handleFeatureClick('Medidas Corporais', 'Performance')}
                    className="justify-between group hover:bg-purple-50"
                    variant="outline"
                  >
                    <span className="flex items-center gap-2">
                      {['Nutri', 'Energia'].includes(currentPlan) ? <Lock className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                      Medidas
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    onClick={() => handleFeatureClick('Fotos de Progresso', 'Performance')}
                    className="justify-between group hover:bg-purple-50"
                    variant="outline"
                  >
                    <span className="flex items-center gap-2">
                      {['Nutri', 'Energia'].includes(currentPlan) ? <Lock className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                      Fotos
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-sm text-gray-600 font-medium mb-2">Recursos inclusos:</p>
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

            {/* Call to Action para Upgrade */}
            {currentPlan === 'Nutri' && (
              <Card className="glass-effect shadow-health border-2 border-health-200 bg-gradient-to-r from-health-50 to-green-50">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 health-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    🚀 Acelere seus resultados!
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Desbloqueie treinos personalizados e acompanhamento completo de progresso. 
                    Transforme seu corpo mais rápido!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => setShowPricing(true)}
                      className="health-gradient shadow-health hover:shadow-lg transition-all"
                      size="lg"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Fazer Upgrade Agora
                    </Button>
                    <Button variant="outline" className="border-health-200">
                      <Clock className="w-4 h-4 mr-2" />
                      7 dias grátis
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