import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  stripe_price_id: string;
  features: string[];
}

interface PricingPlansProps {
  plans: Plan[];
  currentPlan?: string | null;
  onPlanSelect?: () => void;
}

const planIcons = {
  "Plano Nutri": Sparkles,
  "Plano Energia": Zap,
  "Plano Performance": Target,
};

const planColors = {
  "Plano Nutri": "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
  "Plano Energia": "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
  "Plano Performance": "bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800",
};

export function PricingPlans({ plans, currentPlan, onPlanSelect }: PricingPlansProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubscribe = async (priceId: string, planName: string) => {
    try {
      setLoading(priceId);
      
      const { data: sessionData, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) throw error;

      if (sessionData?.url) {
        window.open(sessionData.url, '_blank');
        onPlanSelect?.();
      }
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      toast({
        title: t('pricing.error_title'),
        description: t('pricing.error_checkout'),
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setLoading('manage');
      
      const { data: portalData, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (portalData?.url) {
        window.open(portalData.url, '_blank');
      }
    } catch (error) {
      console.error('Erro ao abrir portal do cliente:', error);
      toast({
        title: t('pricing.error_title'),
        description: t('pricing.error_portal'),
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-6 md:gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
      {plans
        .filter(plan => plan.name === "Plano Energia" || plan.name === "Plano Performance")
        .map((plan) => {
        const Icon = planIcons[plan.name as keyof typeof planIcons] || Sparkles;
        const isCurrentPlan = currentPlan === plan.name;
        const cardStyle = planColors[plan.name as keyof typeof planColors] || "bg-card";
        const isPopular = plan.name === "Plano Energia";

        const borderGradient = plan.name === "Plano Energia" 
          ? 'linear-gradient(135deg, rgb(59 130 246 / 0.4), rgb(37 99 235 / 0.4)) 1'
          : 'linear-gradient(135deg, rgb(147 51 234 / 0.4), rgb(126 34 206 / 0.4)) 1';

        return (
          <Card 
            key={plan.id} 
            className={`relative ${cardStyle} ${isCurrentPlan ? 'ring-2 ring-primary' : ''} ${isPopular ? 'border-primary' : ''} border border-blue-200/50 dark:border-blue-700/50 rounded-[10px]`}
            style={{
              borderImage: borderGradient,
              borderRadius: '10px'
            }}
          >
            {isPopular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                {t('pricing.most_popular')}
              </Badge>
            )}
            {isCurrentPlan && (
              <Badge className="absolute -top-3 right-4 bg-green-500 text-white">
                {t('pricing.your_plan')}
              </Badge>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 rounded-full bg-background/50 w-fit">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription className="text-sm">{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">R$ {plan.price_monthly.toFixed(2).replace('.', ',')}</span>
                <span className="text-muted-foreground">{t('pricing.per_month')}</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {plan.features?.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </CardContent>
            
            <CardFooter>
              {isCurrentPlan ? (
                <Button 
                  onClick={handleManageSubscription}
                  disabled={loading === 'manage'}
                  variant="outline" 
                  className="w-full"
                >
                  {loading === 'manage' ? t('pricing.loading') : t('pricing.manage_subscription')}
                </Button>
              ) : (
                <Button 
                  onClick={() => handleSubscribe(plan.stripe_price_id, plan.name)}
                  disabled={loading === plan.stripe_price_id}
                  className="w-full"
                  variant={isPopular ? "default" : "outline"}
                >
                  {loading === plan.stripe_price_id ? t('pricing.loading') : t('pricing.subscribe_now')}
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}