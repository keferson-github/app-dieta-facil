import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Apple, Flame, Droplets } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NutritionData {
  name: string;
  value: number;
  color: string;
}

interface DailyNutrition {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionChartProps {
  macros: NutritionData[];
  dailyData: DailyNutrition[];
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const NutritionChart = ({ macros, dailyData, targets }: NutritionChartProps) => {
  const { t } = useTranslation();
  
  const today = dailyData[dailyData.length - 1] || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const calorieProgress = (today.calories / targets.calories) * 100;
  const proteinProgress = (today.protein / targets.protein) * 100;
  
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{value: number; name: string}> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium">{payload[0].name}</p>
          <p className="text-sm text-health-600">
            {payload[0].value}g
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="relative rounded-[20px] p-[1px] bg-gradient-to-br from-orange-500 via-transparent to-yellow-500/30 shadow-[0_4px_8px_0_rgba(0,0,0,0.08)]">
      <Card className="rounded-[19px] bg-white dark:bg-slate-900 glass-effect border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Apple className="w-5 h-5 text-health-500" />
          {t('dashboard.nutrition.title')}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          {t('dashboard.nutritionDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today">{t('dashboard.today')}</TabsTrigger>
            <TabsTrigger value="week">{t('dashboard.thisWeek')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macros}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {macros.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {macros.map((macro, index) => (
                    <div key={macro.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-600">{macro.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">{t('dashboard.calories')}</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{today.calories}</div>
                  <div className="text-sm text-gray-600">
                    {t('dashboard.target')}: {targets.calories}
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(calorieProgress, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700">{t('dashboard.protein')}</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{today.protein}g</div>
                  <div className="text-sm text-gray-600">
                    {t('dashboard.target')}: {targets.protein}g
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(proteinProgress, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="week" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#666' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#666' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="calories" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <div className="text-sm font-medium text-blue-700">{t('dashboard.avgCalories')}</div>
                <div className="text-xl font-bold text-blue-600">
                  {Math.round(dailyData.reduce((sum, day) => sum + day.calories, 0) / dailyData.length)}
                </div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <div className="text-sm font-medium text-green-700">{t('dashboard.avgProtein')}</div>
                <div className="text-xl font-bold text-green-600">
                  {Math.round(dailyData.reduce((sum, day) => sum + day.protein, 0) / dailyData.length)}g
                </div>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-lg text-center">
                <div className="text-sm font-medium text-orange-700">{t('dashboard.consistency')}</div>
                <div className="text-xl font-bold text-orange-600">
                  {Math.round((dailyData.filter(day => day.calories > 0).length / dailyData.length) * 100)}%
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </div>
  );
};

export default NutritionChart; 