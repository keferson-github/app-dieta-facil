import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WeightData {
  date: string;
  weight: number;
  target?: number;
}

interface WeightProgressChartProps {
  data: WeightData[];
  currentWeight: number;
  targetWeight: number;
  goal: 'lose_weight' | 'maintain_weight' | 'gain_muscle';
}

const WeightProgressChart = ({ data, currentWeight, targetWeight, goal }: WeightProgressChartProps) => {
  const { t } = useTranslation();
  
  const weightDifference = currentWeight - (data[0]?.weight || currentWeight);
  const isProgressing = goal === 'lose_weight' ? weightDifference < 0 : weightDifference > 0;
  const progressPercentage = Math.abs(weightDifference / (targetWeight - (data[0]?.weight || currentWeight)) * 100);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{value: number}>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium">{formatDate(label)}</p>
          <p className="text-sm text-health-600">
            {t('dashboard.weight')}: {payload[0].value.toFixed(1)}kg
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass-effect border border-blue-200/50 dark:border-blue-700/50" style={{borderImage: 'linear-gradient(135deg, #3b82f6, #06b6d4, #10b981) 1'}}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-health-500" />
              {t('dashboard.weightProgress')}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {t('dashboard.weightProgressDescription')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isProgressing ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
            <span className={`text-sm font-medium ${isProgressing ? 'text-green-600' : 'text-red-600'}`}>
              {weightDifference > 0 ? '+' : ''}{weightDifference.toFixed(1)}kg
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <YAxis 
                domain={['dataMin - 2', 'dataMax + 2']}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine 
                y={targetWeight} 
                stroke="#10b981" 
                strokeDasharray="5 5"
                label={{ value: `Meta: ${targetWeight}kg`, position: "top" }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#1d4ed8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 p-4 bg-health-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">{t('dashboard.currentWeight')}</p>
              <p className="text-2xl font-bold text-gray-900">{currentWeight.toFixed(1)}kg</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{t('dashboard.targetWeight')}</p>
              <p className="text-2xl font-bold text-health-600">{targetWeight.toFixed(1)}kg</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{t('dashboard.progressLabel')}</span>
              <span>{Math.min(progressPercentage, 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-health-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeightProgressChart; 