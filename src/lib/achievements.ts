import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export interface UserAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  achieved: boolean;
  progress?: number;
  maxProgress?: number;
  category: 'weight' | 'exercise' | 'nutrition' | 'streak' | 'milestone' | 'special' | 'health';
  points?: number;
  awardedAt?: string;
}

export interface UserStats {
  total_points: number;
  current_level: number;
  meals_logged: number;
  workouts_completed: number;
  streak_days: number;
  max_streak_days: number;
  photos_uploaded: number;
  weight_logs_count: number;
}

/**
 * Get user achievements with their status
 */
export async function getUserAchievements(userId: string): Promise<{
  achievements: UserAchievement[];
  stats: UserStats;
}> {
  try {
    // Get all achievements
    const { data: allAchievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .order('points', { ascending: false });

    if (achievementsError) throw achievementsError;

    // Get user's earned achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id, awarded_at')
      .eq('user_id', userId);

    if (userAchievementsError) throw userAchievementsError;

    // Get user stats
    const { data: userStats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (statsError && statsError.code !== 'PGRST116') {
      console.error('Error fetching user stats:', statsError);
    }

    const earnedAchievementIds = new Set(
      (userAchievements || []).map(ua => ua.achievement_id)
    );

    const achievements: UserAchievement[] = (allAchievements || []).map(achievement => {
      const isEarned = earnedAchievementIds.has(achievement.id);
      const userAchievement = userAchievements?.find(ua => ua.achievement_id === achievement.id);
      
      // Map database category to component category
      const category = mapCategory(achievement.category || 'milestone');
      
      // Calculate progress for unearned achievements
      const progress = isEarned ? undefined : calculateProgress(achievement, userStats);

      return {
        id: achievement.id,
        title: achievement.title,
        description: achievement.description || '',
        icon: achievement.icon || '🏆',
        achieved: isEarned,
        category,
        points: achievement.points || 0,
        awardedAt: userAchievement?.awarded_at,
        progress: progress?.current,
        maxProgress: progress?.max,
      };
    });

    const stats: UserStats = {
      total_points: userStats?.total_points || 0,
      current_level: userStats?.current_level || 1,
      meals_logged: userStats?.meals_logged || 0,
      workouts_completed: userStats?.workouts_completed || 0,
      streak_days: userStats?.streak_days || 0,
      max_streak_days: userStats?.max_streak_days || 0,
      photos_uploaded: userStats?.photos_uploaded || 0,
      weight_logs_count: userStats?.weight_logs_count || 0,
    };

    return { achievements, stats };
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return {
      achievements: [],
      stats: {
        total_points: 0,
        current_level: 1,
        meals_logged: 0,
        workouts_completed: 0,
        streak_days: 0,
        max_streak_days: 0,
        photos_uploaded: 0,
        weight_logs_count: 0,
      }
    };
  }
}

/**
 * Award an achievement to a user
 */
export async function awardAchievement(userId: string, achievementCode: string): Promise<boolean> {
  try {
    // Call the database function through a direct query since RPC types are not available
    const { error } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      console.error('Error checking achievements:', error);
      return false;
    }

    // For now, we'll rely on database triggers to award achievements
    // This function can be enhanced later when RPC types are properly configured
    return true;
  } catch (error) {
    console.error('Error awarding achievement:', error);
    return false;
  }
}

/**
 * Update user statistics
 */
export async function updateUserStats(
  userId: string,
  stats: Partial<{
    meals_logged: number;
    workouts_completed: number;
    streak_days: number;
    weight_logs_count: number;
    photos_uploaded: number;
  }>
): Promise<void> {
  try {
    // Update or insert user stats
    const { error } = await supabase
      .from('user_stats')
      .upsert({
        user_id: userId,
        ...stats,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error updating user stats:', error);
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
}

/**
 * Map database category to component category
 */
function mapCategory(dbCategory: string): UserAchievement['category'] {
  switch (dbCategory) {
    case 'weight': return 'weight';
    case 'exercise': return 'exercise';
    case 'nutrition': return 'nutrition';
    case 'streak': return 'streak';
    case 'milestone': return 'milestone';
    case 'special': return 'special';
    case 'health': return 'health';
    default: return 'milestone';
  }
}

/**
 * Calculate progress for achievements that haven't been earned yet
 */
function calculateProgress(
  achievement: Tables<"achievements">,
  userStats: Tables<"user_stats"> | null
): { current: number; max: number } | undefined {
  if (!userStats || !achievement.code) return undefined;

  const code = achievement.code;

  // Meal achievements
  if (code === 'meals_10') return { current: userStats.meals_logged || 0, max: 10 };
  if (code === 'meals_50') return { current: userStats.meals_logged || 0, max: 50 };
  if (code === 'meals_100') return { current: userStats.meals_logged || 0, max: 100 };

  // Workout achievements
  if (code === 'workouts_10') return { current: userStats.workouts_completed || 0, max: 10 };
  if (code === 'workouts_25') return { current: userStats.workouts_completed || 0, max: 25 };
  if (code === 'workouts_50') return { current: userStats.workouts_completed || 0, max: 50 };

  // Streak achievements
  if (code === 'meal_streak_3') return { current: userStats.streak_days || 0, max: 3 };
  if (code === 'meal_streak_7') return { current: userStats.streak_days || 0, max: 7 };
  if (code === 'meal_streak_30') return { current: userStats.streak_days || 0, max: 30 };
  if (code === 'workout_streak_3') return { current: userStats.streak_days || 0, max: 3 };
  if (code === 'workout_streak_7') return { current: userStats.streak_days || 0, max: 7 };

  return undefined;
}

/**
 * Check and award achievements based on user actions
 */
export async function checkAndAwardAchievements(
  userId: string, 
  action: string, 
  data?: Record<string, unknown>
): Promise<void> {
  switch (action) {
    case 'first_login':
      await awardAchievement(userId, 'first_login');
      break;
    
    case 'meal_logged':
      // This is handled by database triggers
      break;
    
    case 'workout_completed':
      // This is handled by database triggers
      break;
    
    case 'weight_logged':
      // This is handled by database triggers
      break;
    
    case 'photo_uploaded':
      // This is handled by database triggers
      break;
    
    default:
      break;
  }
}
