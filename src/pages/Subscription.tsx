import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Check, 
  X,
  Crown,
  Zap,
  Target,
  Calendar,
  AlertCircle,
  CheckCircle,
  Star,
  Gift,
  ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { PricingPlans } from "@/components/PricingPlans";
import Layout from "@/components/Layout";

interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  stripe_price_id: string;
  features: string[];
}

const Subscription = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { subscription, loading: subscriptionLoading, refetch } = useSubscription();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly');

      if (error) throw error;

      const plansWithFeatures = (data || []).map(plan => ({
        ...plan,
        features: getPlanFeatures(plan.name)
      }));

      setPlans(plansWithFeatures);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os planos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanFeatures = (planName: string): string[] => {
    const featuresMap: Record<string, string[]> = {
      'Plano Nutri': [
        'Refeições personalizadas',
        'Cardápio semanal',
        'Controle de calorias',
        'Histórico de refeições',
        'Suporte básico'
      ],
      'Plano Energia': [
        'Tudo do Plano Nutri',
        'Fichas de treino completas',
        'Exercícios para casa',
        'Biblioteca de exercícios',
        'Histórico de treinos',
        'Suporte prioritário'
      ],
      'Plano Performance': [
        'Tudo do Plano Energia',
        'Relatórios detalhados',
        'Medidas corporais',
        'Fotos de progresso',
        'Análises avançadas',
        'Suporte 24/7'
      ],
    };
    return featuresMap[planName] || [];
  };

  const handleCancelSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Here you would typically call your backend to cancel the Stripe subscription
      toast({
        title: "Cancelamento solicitado",
        description: "Sua assinatura será cancelada no final do período atual",
      });
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar a assinatura",
        variant: "destructive",
      });
    }
  };

  const getPlanIcon = (planName: string) => {
    if (planName.includes('Nutri')) return Crown;
    if (planName.includes('Energia')) return Zap;
    if (planName.includes('Performance')) return Target;
    return CreditCard;
  };

  const getPlanColor = (planName: string) => {
    if (planName.includes('Nutri')) return 'text-green-500 bg-green-100';
    if (planName.includes('Energia')) return 'text-blue-500 bg-blue-100';
    if (planName.includes('Performance')) return 'text-purple-500 bg-purple-100';
    return 'text-gray-500 bg-gray-100';
  };

  if (loading || subscriptionLoading) {
    return (
      <Layout title="Assinatura" description="Carregando informações da assinatura...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 health-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-500 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-secondary-dark">Carregando assinatura...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="💳 Assinatura" 
      description="Gerencie sua assinatura e planos"
    >
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Current Subscription Status */}
        <div className="mb-8">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Status da Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscription?.subscribed ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getPlanColor(subscription.plan)}`}>
                        {(() => {
                          const IconComponent = getPlanIcon(subscription.plan);
                          return <IconComponent className="w-5 h-5" />;
                        })()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-primary-dark">{subscription.plan}</h3>
                        <p className="text-sm text-gray-600">Assinatura ativa</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        R$ {plans.find(p => p.name === subscription.plan)?.price_monthly || 0}
                      </div>
                      <div className="text-sm text-gray-600">por mês</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {subscription.next_billing_date ? 
                          new Date(subscription.next_billing_date).toLocaleDateString('pt-BR') : 
                          'N/A'
                        }
                      </div>
                      <div className="text-sm text-gray-600">próxima cobrança</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {subscription.days_remaining || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">dias restantes</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Alterar Plano
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={handleCancelSubscription}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Plano Gratuito</h3>
                  <p className="text-gray-500 mb-6">
                    Você está usando o Plano Nutri gratuito com funcionalidades básicas
                  </p>
                  <Button className="health-gradient shadow-health">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Fazer Upgrade
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        {subscription?.subscribed && (
          <div className="mb-8">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Seus Benefícios Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans.find(p => p.name === subscription.plan)?.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-primary-dark mb-2">
              {subscription?.subscribed ? 'Outros Planos Disponíveis' : 'Escolha Seu Plano'}
            </h2>
            <p className="text-secondary-dark">
              {subscription?.subscribed ? 
                'Faça upgrade ou downgrade do seu plano a qualquer momento' :
                'Desbloqueie todo o potencial da sua jornada fitness'
              }
            </p>
          </div>

          <PricingPlans 
            plans={plans} 
            onPlanSelect={() => {
              refetch();
              toast({
                title: "Plano atualizado!",
                description: "Seu plano foi atualizado com sucesso",
              });
            }}
            currentPlan={subscription?.plan}
          />
        </div>

        {/* FAQ Section */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-primary-dark mb-2">Posso cancelar a qualquer momento?</h4>
              <p className="text-gray-600 text-sm">
                Sim, você pode cancelar sua assinatura a qualquer momento. O acesso aos recursos premium 
                continuará até o final do período de cobrança atual.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-primary-dark mb-2">Como funciona o upgrade de plano?</h4>
              <p className="text-gray-600 text-sm">
                Ao fazer upgrade, você terá acesso imediato aos novos recursos. A diferença de preço 
                será cobrada proporcionalmente no próximo ciclo de cobrança.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-primary-dark mb-2">Meus dados são mantidos se eu cancelar?</h4>
              <p className="text-gray-600 text-sm">
                Sim, todos os seus dados (refeições, treinos, progresso) são mantidos mesmo após o 
                cancelamento. Você continuará com acesso às funcionalidades básicas.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-primary-dark mb-2">Há desconto para pagamento anual?</h4>
              <p className="text-gray-600 text-sm">
                Atualmente oferecemos apenas planos mensais, mas estamos trabalhando em opções anuais 
                com desconto. Fique atento às novidades!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Subscription;