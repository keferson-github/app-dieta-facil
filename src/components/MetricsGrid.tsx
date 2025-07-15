import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Zap, 
  Activity, 
  Heart, 
  Plus,
  Apple,
  Droplets,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NutritionMetric {
  name: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  icon: React.ElementType;
}

interface MetricsGridProps {
  metrics?: {
    calories: { current: number; target: number };
    protein: { current: number; target: number };
    carbs: { current: number; target: number };
    fat: { current: number; target: number };
    water: { current: number; target: number };
    steps: { current: number; target: number };
  };
  onAddMeal?: () => void;
  onQuickLog?: (type: string) => void;
  className?: string;
}

const MetricsGrid = ({ 
  metrics = {
    calories: { current: 1250, target: 2000 },
    protein: { current: 65, target: 150 },
    carbs: { current: 140, target: 250 },
    fat: { current: 45, target: 65 },
    water: { current: 1.2, target: 2.5 },
    steps: { current: 6500, target: 10000 }
  },
  onAddMeal,
  onQuickLog,
  className 
}: MetricsGridProps) => {

  const nutritionMetrics: NutritionMetric[] = [
    {
      name: "Calorias",
      current: metrics.calories.current,
      target: metrics.calories.target,
      unit: "kcal",
      color: "text-orange-600",
      icon: Zap,
    },
    {
      name: "Proteínas",
      current: metrics.protein.current,
      target: metrics.protein.target,
      unit: "g",
      color: "text-blue-600",
      icon: Target,
    },
    {
      name: "Carboidratos",
      current: metrics.carbs.current,
      target: metrics.carbs.target,
      unit: "g",
      color: "text-green-600",
      icon: Activity,
    },
    {
      name: "Gorduras",
      current: metrics.fat.current,
      target: metrics.fat.target,
      unit: "g",
      color: "text-yellow-600",
      icon: Heart,
    },
  ];

  const secondaryMetrics = [
    {
      name: "Água",
      current: metrics.water.current,
      target: metrics.water.target,
      unit: "L",
      color: "text-cyan-600",
      icon: Droplets,
    },
    {
      name: "Passos",
      current: metrics.steps.current,
      target: metrics.steps.target,
      unit: "",
      color: "text-purple-600",
      icon: Clock,
    },
  ];

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 70) return "bg-yellow-500";
    if (percentage >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const formatNumber = (num: number, unit: string) => {
    if (unit === "L") return num.toFixed(1);
    if (unit === "") return num.toLocaleString();
    return Math.round(num);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Quick Actions */}
      <div className="flex gap-2 mb-4">
        <Button
          onClick={onAddMeal}
          className="health-gradient shadow-health flex-1 h-12"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Refeição
        </Button>
        <Button
          variant="outline"
          onClick={() => onQuickLog?.('water')}
          className="aspect-square h-12 p-0 border-cyan-200 hover:bg-cyan-50"
        >
          <Droplets className="w-5 h-5 text-cyan-600" />
        </Button>
      </div>

      {/* Main Nutrition Grid */}
      <div className="grid grid-cols-2 gap-3">
        {nutritionMetrics.map((metric, index) => {
          const percentage = Math.min(100, (metric.current / metric.target) * 100);
          const IconComponent = metric.icon;
          
          return (
            <Card
              key={metric.name}
              className={cn(
                "glass-effect border border-blue-200/50 dark:border-blue-700/50 shadow-sm hover:shadow-health transition-all duration-200 cursor-pointer rounded-[10px]",
                "active:scale-95"
              )}
              style={{
                borderImage: 'linear-gradient(135deg, rgb(59 130 246 / 0.3), rgb(16 185 129 / 0.3), rgb(245 158 11 / 0.3)) 1',
                borderRadius: '10px'
              }}
              onClick={() => onQuickLog?.(metric.name.toLowerCase())}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    metric.color.replace('text-', 'bg-').replace('-600', '-100')
                  )}>
                    <IconComponent className={cn("w-4 h-4", metric.color)} />
                  </div>
                  <span className="text-xs font-medium text-secondary-dark">
                    {Math.round(percentage)}%
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold text-primary-dark">
                      {formatNumber(metric.current, metric.unit)}
                    </span>
                    <span className="text-xs text-secondary-dark">
                      /{formatNumber(metric.target, metric.unit)} {metric.unit}
                    </span>
                  </div>
                  
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                  
                  <p className="text-xs font-medium text-secondary-dark">
                    {metric.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 gap-3">
        {secondaryMetrics.map((metric) => {
          const percentage = Math.min(100, (metric.current / metric.target) * 100);
          const IconComponent = metric.icon;
          
          return (
            <Card
              key={metric.name}
              className="glass-effect border border-cyan-200/50 dark:border-cyan-700/50 shadow-sm hover:shadow-health transition-all duration-200 cursor-pointer active:scale-95 rounded-[10px]"
              style={{
                borderImage: 'linear-gradient(135deg, rgb(6 182 212 / 0.3), rgb(147 51 234 / 0.3)) 1',
                borderRadius: '10px'
              }}
              onClick={() => onQuickLog?.(metric.name.toLowerCase())}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    metric.color.replace('text-', 'bg-').replace('-600', '-100')
                  )}>
                    <IconComponent className={cn("w-4 h-4", metric.color)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-sm font-bold text-primary-dark">
                        {formatNumber(metric.current, metric.unit)}
                      </span>
                      <span className="text-xs text-secondary-dark">
                        /{formatNumber(metric.target, metric.unit)} {metric.unit}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                    <p className="text-xs font-medium text-secondary-dark mt-1">
                      {metric.name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Today's Summary */}
      <Card 
        className="glass-effect border border-green-200/50 dark:border-green-700/50 shadow-sm rounded-[10px]"
        style={{
          borderImage: 'linear-gradient(135deg, rgb(34 197 94 / 0.3), rgb(16 185 129 / 0.3)) 1',
          borderRadius: '10px'
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-primary-dark flex items-center gap-2">
              <Apple className="w-4 h-4 text-health-600" />
              Resumo de Hoje
            </h3>
            <span className="text-xs bg-health-50 dark:bg-health-900/20 text-health-700 dark:text-health-400 px-2 py-1 rounded-full">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short' 
              })}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-primary-dark">
                {metrics.calories.target - metrics.calories.current}
              </p>
              <p className="text-xs text-secondary-dark">Calorias restantes</p>
            </div>
            <div>
              <p className="text-xl font-bold text-health-600">
                {Math.round((metrics.calories.current / metrics.calories.target) * 100)}%
              </p>
              <p className="text-xs text-secondary-dark">Meta atingida</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsGrid;
