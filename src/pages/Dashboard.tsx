import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, User, TrendingUp, Calendar, Target, Apple, Dumbbell, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PricingPlans } from "@/components/PricingPlans";
import { useSubscription } from "@/hooks/useSubscription";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPricing, setShowPricing] = useState(false);
  const [plans, setPlans] = useState([]);
  const { subscription, loading: subscriptionLoading, refetch: refetchSubscription } = useSubscription();

  useEffect(() => {
    checkUserProfile();
    loadPlans();
  }, []);

  useEffect(() => {
    // Verificar se voltou do Stripe
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      toast({
        title: "Sucesso!",
        description: "Sua assinatura foi ativada com sucesso!",
      });
      refetchSubscription();
      // Limpar URL
      window.history.replaceState({}, '', '/dashboard');
    } else if (urlParams.get('canceled') === 'true') {
      toast({
        title: "Cancelado",
        description: "O processo de assinatura foi cancelado.",
        variant: "destructive",
      });
      // Limpar URL
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  const checkUserProfile = async () => {
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
        // Se não tem perfil, redireciona para onboarding
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
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg font-medium">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Olá, {userProfile?.gender === 'masculino' ? 'bem-vindo' : 'bem-vinda'} de volta!
            </p>
            {subscription && (
              <div className="flex items-center gap-2 mt-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {subscription.subscribed ? `${subscription.plan} - Ativo` : 'Sem assinatura ativa'}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {subscription?.subscribed ? (
              <Button 
                onClick={() => setShowPricing(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Gerenciar Plano
              </Button>
            ) : (
              <Button 
                onClick={() => setShowPricing(true)}
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Assinar Agora
              </Button>
            )}
            <Button 
              onClick={() => navigate('/settings')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
          </div>
        </div>

        {!showPricing && (
          <>
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200 dark:border-green-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Peso Atual</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userProfile?.weight || 0} kg</div>
                  <p className="text-xs text-muted-foreground">
                    Meta: {userProfile?.target_weight || 0} kg
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-blue-200 dark:border-blue-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">IMC</CardTitle>
                  <User className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userProfile?.weight && userProfile?.height 
                      ? (userProfile.weight / Math.pow(userProfile.height / 100, 2)).toFixed(1) 
                      : '0.0'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Índice de Massa Corporal
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-purple-200 dark:border-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Objetivo</CardTitle>
                  <Target className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold capitalize">{userProfile?.goal || 'Não definido'}</div>
                  <p className="text-xs text-muted-foreground">
                    Meta principal
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-orange-200 dark:border-orange-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Atividade</CardTitle>
                  <Calendar className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold capitalize">{userProfile?.activity_level || 'Não informado'}</div>
                  <p className="text-xs text-muted-foreground">
                    Nível de atividade
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {showPricing ? (
          <div className="space-y-6">
            <div className="text-center">
              <Button 
                onClick={() => setShowPricing(false)}
                variant="ghost"
                className="mb-4"
              >
                ← Voltar ao Dashboard
              </Button>
              <h2 className="text-2xl font-bold mb-2">Escolha seu Plano</h2>
              <p className="text-muted-foreground">
                Desbloqueie todo o potencial do Dieta Fácil Fit
              </p>
            </div>
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
          <>
            {/* Ações Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Apple className="h-5 w-5 text-red-500" />
                    Alimentação
                  </CardTitle>
                  <CardDescription>
                    Registre suas refeições e acompanhe sua nutrição
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="outline">
                    Registrar Refeição
                  </Button>
                  <Button className="w-full" variant="outline">
                    Ver Plano Alimentar
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-blue-500" />
                    Exercícios
                  </CardTitle>
                  <CardDescription>
                    Acompanhe seus treinos e evolução física
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="outline">
                    Iniciar Treino
                  </Button>
                  <Button className="w-full" variant="outline">
                    Ver Plano de Treino
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;