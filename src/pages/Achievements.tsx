import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Star, 
  Target, 
  Zap,
  Award,
  Medal,
  Crown,
  Flame,
  Heart,
  Apple,
  Dumbbell,
  Calendar,
  TrendingUp,
  Lock,
  CheckCircle,
  Camera
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getUserAchievements, type UserAchievement } from "@/lib/achievements";
import Layout from "@/components/Layout";

interface UserStats {
  total_points: number;
  current_level: number;
  meals_logged: number;
  workouts_completed: number;
  streak_days: number;
  photos_uploaded: number;
  weight_logs_count: number;
}

const Achievements = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    total_points: 0,
    current_level: 1,
    meals_logged: 0,
    workouts_completed: 0,
    streak_days: 0,
    photos_uploaded: 0,
    weight_logs_count: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { achievements: userAchievements, stats } = await getUserAchievements(session.user.id);
      
      setAchievements(userAchievements);
      setUserStats(stats);
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conquistas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = (type: string) => {
    const icons = {
      meals: Apple,
      workouts: Dumbbell,
      streak: Flame,
      weight: Target,
      photos: Camera,
      level: Crown,
      points: Star
    };
    return icons[type as keyof typeof icons] || Trophy;
  };

  const getAchievementColor = (type: string) => {
    const colors = {
      meals: "text-green-500",
      workouts: "text-blue-500",
      streak: "text-orange-500",
      weight: "text-purple-500",
      photos: "text-pink-500",
      level: "text-yellow-500",
      points: "text-indigo-500"
    };
    return colors[type as keyof typeof colors] || "text-gray-500";
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: "border-gray-300 bg-gray-50",
      rare: "border-blue-300 bg-blue-50",
      epic: "border-purple-300 bg-purple-50",
      legendary: "border-yellow-300 bg-yellow-50"
    };
    return colors[rarity as keyof typeof colors] || "border-gray-300 bg-gray-50";
  };

  const getRarityLabel = (rarity: string) => {
    const labels = {
      common: "Comum",
      rare: "Raro",
      epic: "Épico", 
      legendary: "Lendário"
    };
    return labels[rarity as keyof typeof labels] || rarity;
  };

  const completedAchievements = achievements.filter(a => a.completed);
  const inProgressAchievements = achievements.filter(a => !a.completed);

  const nextLevelPoints = userStats.current_level * 1000;
  const currentLevelProgress = (userStats.total_points % 1000) / 10;

  if (loading) {
    return (
      <Layout title="Conquistas" description="Carregando suas conquistas...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 health-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-500 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-secondary-dark">Carregando conquistas...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="🏆 Conquistas" 
      description="Acompanhe seu progresso e desbloqueie novas conquistas"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* User Level & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-effect bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200">
            <CardContent className="p-6 text-center">
              <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-yellow-600 mb-1">Nível {userStats.current_level}</div>
              <div className="text-sm text-gray-600 mb-3">{userStats.total_points} pontos totais</div>
              <Progress value={currentLevelProgress} className="h-2" />
              <div className="text-xs text-gray-500 mt-2">
                {1000 - (userStats.total_points % 1000)} pontos para o próximo nível
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-primary-dark">Conquistas</h3>
                <Medal className="w-5 h-5 text-health-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Concluídas</span>
                  <span className="font-semibold text-green-600">{completedAchievements.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Em progresso</span>
                  <span className="font-semibold text-blue-600">{inProgressAchievements.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-semibold text-primary-dark">{achievements.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-primary-dark">Estatísticas</h3>
                <TrendingUp className="w-5 h-5 text-health-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Refeições</span>
                  <span className="font-semibold text-green-600">{userStats.meals_logged}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Treinos</span>
                  <span className="font-semibold text-blue-600">{userStats.workouts_completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sequência</span>
                  <span className="font-semibold text-orange-600">{userStats.streak_days} dias</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completed Achievements */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-semibold text-primary-dark">Conquistas Concluídas</h2>
            <Badge className="bg-green-100 text-green-800">{completedAchievements.length}</Badge>
          </div>

          {completedAchievements.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma conquista concluída ainda</p>
                <p className="text-sm text-gray-400 mt-1">Continue se exercitando e registrando suas refeições!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedAchievements.map((achievement) => {
                const IconComponent = getAchievementIcon(achievement.type);
                return (
                  <Card 
                    key={achievement.id} 
                    className={`${getRarityColor(achievement.rarity)} border-2 hover:shadow-lg transition-all duration-300`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center ${getAchievementColor(achievement.type)}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-primary-dark">{achievement.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {getRarityLabel(achievement.rarity)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-medium text-yellow-600">+{achievement.points} pontos</span>
                            </div>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* In Progress Achievements */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-primary-dark">Em Progresso</h2>
            <Badge className="bg-blue-100 text-blue-800">{inProgressAchievements.length}</Badge>
          </div>

          {inProgressAchievements.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Todas as conquistas foram concluídas!</p>
                <p className="text-sm text-gray-400 mt-1">Parabéns pelo seu progresso incrível!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgressAchievements.map((achievement) => {
                const IconComponent = getAchievementIcon(achievement.type);
                const progressPercentage = (achievement.current_progress / achievement.target_value) * 100;
                
                return (
                  <Card 
                    key={achievement.id} 
                    className="border-2 border-gray-200 hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center ${getAchievementColor(achievement.type)}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-primary-dark">{achievement.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {getRarityLabel(achievement.rarity)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Progresso</span>
                              <span className="font-medium">
                                {achievement.current_progress}/{achievement.target_value}
                              </span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-medium text-yellow-600">+{achievement.points} pontos</span>
                              </div>
                              <span className="text-xs text-gray-500">{Math.round(progressPercentage)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Achievements;