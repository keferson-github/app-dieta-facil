import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Target, Flame, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  achieved: boolean;
  progress?: number;
  maxProgress?: number;
  category: 'weight' | 'exercise' | 'nutrition' | 'streak' | 'milestone' | 'special' | 'health';
}

interface AchievementsCardProps {
  achievements: Achievement[];
  totalPoints: number;
  level: number;
}

const AchievementsCard = ({ achievements, totalPoints, level }: AchievementsCardProps) => {
  const { t } = useTranslation();
  
  const completedAchievements = achievements.filter(a => a.achieved);
  const inProgressAchievements = achievements.filter(a => !a.achieved && a.progress !== undefined);
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'weight': return <Target className="w-4 h-4" />;
      case 'exercise': return <Flame className="w-4 h-4" />;
      case 'nutrition': return <Star className="w-4 h-4" />;
      case 'streak': return <Trophy className="w-4 h-4" />;
      case 'milestone': return <Award className="w-4 h-4" />;
      case 'special': return <Star className="w-4 h-4" />;
      case 'health': return <Target className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'weight': return 'bg-blue-100 text-blue-800';
      case 'exercise': return 'bg-red-100 text-red-800';
      case 'nutrition': return 'bg-green-100 text-green-800';
      case 'streak': return 'bg-orange-100 text-orange-800';
      case 'milestone': return 'bg-purple-100 text-purple-800';
      case 'special': return 'bg-yellow-100 text-yellow-800';
      case 'health': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative rounded-[20px] p-[1px] bg-gradient-to-br from-yellow-500 via-transparent to-amber-500/30 shadow-[0_4px_8px_0_rgba(0,0,0,0.08)]">
      <Card className="rounded-[19px] bg-white dark:bg-slate-900 glass-effect border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-health-500" />
              {t('dashboard.achievements')}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {t('dashboard.achievementsDescription')}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-health-600">{level}</div>
              <div className="text-sm text-gray-600">{t('dashboard.level')}</div>
            </div>
            <div className="text-sm text-gray-500">{totalPoints} {t('dashboard.points')}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-gold-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600">{completedAchievements.length}</div>
            <div className="text-sm text-yellow-700">{t('dashboard.completed')}</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{inProgressAchievements.length}</div>
            <div className="text-sm text-blue-700">{t('dashboard.inProgress')}</div>
          </div>
          <div className="p-3 bg-health-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-health-600">{achievements.length}</div>
            <div className="text-sm text-health-700">{t('dashboard.total')}</div>
          </div>
        </div>

        {/* Conquistas Recentes */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            {t('dashboard.recentAchievements')}
          </h4>
          <div className="space-y-3">
            {completedAchievements.slice(0, 3).map((achievement) => (
              <div 
                key={achievement.id} 
                className="relative rounded-[20px] p-[1px] bg-gradient-to-br from-green-500 via-transparent to-emerald-500/30 shadow-[0_4px_8px_0_rgba(0,0,0,0.08)]"
              >
                <div className="rounded-[19px] bg-white dark:bg-slate-900 flex items-center gap-3 p-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{achievement.title}</div>
                    <div className="text-sm text-gray-600">{achievement.description}</div>
                  </div>
                  <Badge className={getCategoryColor(achievement.category)}>
                    {getCategoryIcon(achievement.category)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progresso Atual */}
        {inProgressAchievements.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              {t('dashboard.currentProgress')}
            </h4>
            <div className="space-y-3">
              {inProgressAchievements.slice(0, 2).map((achievement) => (
                <div key={achievement.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{achievement.icon}</span>
                      <span className="font-medium text-gray-900">{achievement.title}</span>
                    </div>
                    <Badge variant="outline" className={getCategoryColor(achievement.category)}>
                      {getCategoryIcon(achievement.category)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{achievement.description}</div>
                  {achievement.progress !== undefined && achievement.maxProgress && (
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{t('dashboard.progressLabel')}</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-health-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Barra de Progresso do Nível */}
        <div className="p-4 bg-gradient-to-r from-health-50 to-health-100 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-health-700">{t('dashboard.nextLevel')}</span>
            <span className="text-sm text-health-600">{totalPoints}/1000</span>
          </div>
          <div className="w-full bg-health-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-health-500 to-health-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((totalPoints / 1000) * 100, 100)}%` }}
            />
          </div>
          <div className="text-xs text-health-600 mt-1">
            {1000 - totalPoints} {t('dashboard.pointsToNextLevel')}
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
};

export default AchievementsCard; 