import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ActivityData {
  day: string;
  workouts: number;
  duration: number;
  calories?: number;
}

interface ActivityChartProps {
  data: ActivityData[];
  weeklyGoal: number;
}

const ActivityChart = ({ data, weeklyGoal }: ActivityChartProps) => {
  const { t } = useTranslation();
  
  const totalWorkouts = data.reduce((sum, day) => sum + day.workouts, 0);
  const totalDuration = data.reduce((sum, day) => sum + day.duration, 0);
  const averageDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;
  const goalProgress = (totalWorkouts / weeklyGoal) * 100;

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const getBarColor = (workouts: number) => {
    if (workouts === 0) return '#e5e7eb';
    if (workouts === 1) return '#3b82f6';
    if (workouts === 2) return '#10b981';
    return '#f59e0b';
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{value: number; payload: ActivityData}>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-blue-600">
            {t('dashboard.workouts')}: {data.workouts}
          </p>
          <p className="text-sm text-green-600">
            {t('dashboard.duration')}: {data.duration}min
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card 
      className="glass-effect border border-green-200/50 dark:border-green-700/50 rounded-[10px]" 
      style={{
        borderImage: 'linear-gradient(135deg, #22c55e, #10b981, #3b82f6) 1',
        borderRadius: '10px'
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-health-500" />
              {t('dashboard.weeklyActivity')}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {t('dashboard.weeklyActivityDescription')}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-health-600">{totalWorkouts}</div>
            <div className="text-sm text-gray-600">{t('dashboard.thisWeek')}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48 w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="workouts" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.workouts)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">{t('dashboard.totalWorkouts')}</span>
            </div>
            <div className="text-xl font-bold text-blue-600">{totalWorkouts}</div>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-700">{t('dashboard.avgDuration')}</span>
            </div>
            <div className="text-xl font-bold text-green-600">{averageDuration.toFixed(0)}min</div>
          </div>
          
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-700">{t('dashboard.goalProgress')}</span>
            </div>
            <div className="text-xl font-bold text-orange-600">{goalProgress.toFixed(0)}%</div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-health-50 rounded-lg">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{t('dashboard.weeklyGoal')}</span>
            <span>{totalWorkouts}/{weeklyGoal} {t('dashboard.workouts')}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-health-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(goalProgress, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityChart; 