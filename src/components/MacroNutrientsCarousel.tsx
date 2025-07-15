import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface MacroData {
  name: string;
  current: number;
  target: number;
  color: string;
  icon: string;
}

interface MacroNutrientsCarouselProps {
  macros: {
    protein: { current: number; target: number };
    carbs: { current: number; target: number };
    fat: { current: number; target: number };
  };
}

const MacroNutrientsCarousel = ({ macros }: MacroNutrientsCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const macroData: MacroData[] = [
    {
      name: 'Proteínas',
      current: macros.protein.current,
      target: macros.protein.target,
      color: '#3b82f6',
      icon: '💪'
    },
    {
      name: 'Carboidratos',
      current: macros.carbs.current,
      target: macros.carbs.target,
      color: '#10b981',
      icon: '🌾'
    },
    {
      name: 'Gorduras',
      current: macros.fat.current,
      target: macros.fat.target,
      color: '#f59e0b',
      icon: '🥑'
    }
  ];

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = 280 + 16; // 280px (min-width) + 16px (gap)
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(Math.min(newIndex, macroData.length - 1));
    }
  }, [macroData.length]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const createPieData = (current: number, target: number) => [
    { name: 'Consumido', value: current, color: '#3b82f6' },
    { name: 'Restante', value: Math.max(0, target - current), color: '#e5e7eb' }
  ];

  return (
    <div className="relative">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary-dark flex items-center gap-2">
          🍎 Macronutrientes de Hoje
        </h3>
        <p className="text-sm text-secondary-dark">Acompanhe sua distribuição nutricional</p>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {macroData.map((macro, index) => {
          const percentage = (macro.current / macro.target) * 100;
          const pieData = createPieData(macro.current, macro.target);
          
          // Define colors for gradient borders based on macro type
          const gradientColors = {
            'Proteínas': 'from-blue-500 to-cyan-500/30',
            'Carboidratos': 'from-green-500 to-emerald-500/30', 
            'Gorduras': 'from-yellow-500 to-amber-500/30'
          };
          
          return (
            <div
              key={macro.name}
              className={`relative rounded-[20px] p-[1px] min-w-[280px] snap-start shadow-[0_4px_8px_0_rgba(0,0,0,0.08)] ${
                macro.name === 'Proteínas' ? 'bg-gradient-to-br from-blue-500 via-transparent to-blue-400/30' :
                macro.name === 'Carboidratos' ? 'bg-gradient-to-br from-green-500 via-transparent to-green-400/30' :
                'bg-gradient-to-br from-yellow-500 via-transparent to-yellow-400/30'
              }`}
            >
              <Card className="rounded-[19px] bg-white dark:bg-slate-900 glass-effect hover:shadow-md transition-shadow h-full border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-primary-dark flex items-center gap-2">
                    <span className="text-lg">{macro.icon}</span>
                    {macro.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-primary-dark">
                          {macro.current}g
                        </span>
                        <span className="text-sm text-secondary-dark">
                          / {macro.target}g
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className="mt-2 h-2"
                        style={{ 
                          background: '#f3f4f6'
                        }}
                      />
                      <p className="text-xs text-secondary-dark mt-1">
                        {percentage.toFixed(0)}% da meta
                      </p>
                    </div>
                    
                    <div className="w-16 h-16 ml-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={12}
                            outerRadius={30}
                            paddingAngle={2}
                            dataKey="value"
                            startAngle={90}
                            endAngle={450}
                          >
                            <Cell fill={macro.color} />
                            <Cell fill="#e5e7eb" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-secondary-dark text-center">
                      {macro.current >= macro.target 
                        ? '🎯 Meta atingida!' 
                        : `Faltam ${(macro.target - macro.current).toFixed(1)}g`
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {macroData.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-health-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default MacroNutrientsCarousel;
