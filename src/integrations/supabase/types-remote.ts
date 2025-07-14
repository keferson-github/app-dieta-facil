export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string | null
          code: string
          description: string | null
          icon: string | null
          id: string
          points: number | null
          title: string
        }
        Insert: {
          category?: string | null
          code: string
          description?: string | null
          icon?: string | null
          id?: string
          points?: number | null
          title: string
        }
        Update: {
          category?: string | null
          code?: string
          description?: string | null
          icon?: string | null
          id?: string
          points?: number | null
          title?: string
        }
        Relationships: []
      }
      activity_stats: {
        Row: {
          activity_date: string
          calories_burned: number | null
          created_at: string | null
          day_of_week: string | null
          id: string
          is_active: boolean | null
          steps_count: number | null
          total_duration_minutes: number | null
          user_id: string | null
          workouts_count: number | null
        }
        Insert: {
          activity_date: string
          calories_burned?: number | null
          created_at?: string | null
          day_of_week?: string | null
          id?: string
          is_active?: boolean | null
          steps_count?: number | null
          total_duration_minutes?: number | null
          user_id?: string | null
          workouts_count?: number | null
        }
        Update: {
          activity_date?: string
          calories_burned?: number | null
          created_at?: string | null
          day_of_week?: string | null
          id?: string
          is_active?: boolean | null
          steps_count?: number | null
          total_duration_minutes?: number | null
          user_id?: string | null
          workouts_count?: number | null
        }
        Relationships: []
      }
      bmi_history: {
        Row: {
          bmi: number
          calculated_at: string | null
          category: string | null
          height_cm: number
          id: string
          user_id: string | null
          weight_kg: number
        }
        Insert: {
          bmi: number
          calculated_at?: string | null
          category?: string | null
          height_cm: number
          id?: string
          user_id?: string | null
          weight_kg: number
        }
        Update: {
          bmi?: number
          calculated_at?: string | null
          category?: string | null
          height_cm?: number
          id?: string
          user_id?: string | null
          weight_kg?: number
        }
        Relationships: []
      }
      body_measurements: {
        Row: {
          bicep_left: number | null
          bicep_right: number | null
          body_fat_percentage: number | null
          chest: number | null
          height: number | null
          hips: number | null
          id: string
          measured_at: string | null
          muscle_mass: number | null
          notes: string | null
          thigh_left: number | null
          thigh_right: number | null
          user_id: string | null
          waist: number | null
          weight: number | null
        }
        Insert: {
          bicep_left?: number | null
          bicep_right?: number | null
          body_fat_percentage?: number | null
          chest?: number | null
          height?: number | null
          hips?: number | null
          id?: string
          measured_at?: string | null
          muscle_mass?: number | null
          notes?: string | null
          thigh_left?: number | null
          thigh_right?: number | null
          user_id?: string | null
          waist?: number | null
          weight?: number | null
        }
        Update: {
          bicep_left?: number | null
          bicep_right?: number | null
          body_fat_percentage?: number | null
          chest?: number | null
          height?: number | null
          hips?: number | null
          id?: string
          measured_at?: string | null
          muscle_mass?: number | null
          notes?: string | null
          thigh_left?: number | null
          thigh_right?: number | null
          user_id?: string | null
          waist?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      daily_activity_logs: {
        Row: {
          activity_date: string
          created_at: string | null
          id: string
          logged_in: boolean | null
          meals_logged: number | null
          total_activities: number | null
          updated_at: string | null
          user_id: string
          water_logged: boolean | null
          weight_logged: boolean | null
          workouts_completed: number | null
        }
        Insert: {
          activity_date: string
          created_at?: string | null
          id?: string
          logged_in?: boolean | null
          meals_logged?: number | null
          total_activities?: number | null
          updated_at?: string | null
          user_id: string
          water_logged?: boolean | null
          weight_logged?: boolean | null
          workouts_completed?: number | null
        }
        Update: {
          activity_date?: string
          created_at?: string | null
          id?: string
          logged_in?: boolean | null
          meals_logged?: number | null
          total_activities?: number | null
          updated_at?: string | null
          user_id?: string
          water_logged?: boolean | null
          weight_logged?: boolean | null
          workouts_completed?: number | null
        }
        Relationships: []
      }
      daily_steps: {
        Row: {
          created_at: string | null
          data_source: string | null
          id: string
          recorded_date: string
          step_count: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_source?: string | null
          id?: string
          recorded_date: string
          step_count: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_source?: string | null
          id?: string
          recorded_date?: string
          step_count?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      diet_plans: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty_level: number | null
          equipment: string | null
          exercise_type: string | null
          id: string
          image_url: string | null
          instructions: string | null
          muscle_group: string
          name: string
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          equipment?: string | null
          exercise_type?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          muscle_group: string
          name: string
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          equipment?: string | null
          exercise_type?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          muscle_group?: string
          name?: string
          video_url?: string | null
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          food_id: number | null
          id: string
          logged_at: string | null
          meal_id: string | null
          meal_type: string | null
          quantity_grams: number
          user_id: string | null
        }
        Insert: {
          food_id?: number | null
          id?: string
          logged_at?: string | null
          meal_id?: string | null
          meal_type?: string | null
          quantity_grams: number
          user_id?: string | null
        }
        Update: {
          food_id?: number | null
          id?: string
          logged_at?: string | null
          meal_id?: string | null
          meal_type?: string | null
          quantity_grams?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_logs_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods_free"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_logs_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meal_nutrition"
            referencedColumns: ["meal_id"]
          },
          {
            foreignKeyName: "food_logs_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      foods_free: {
        Row: {
          calories_per_100g: number
          carbs_per_100g: number
          category: string
          fats_per_100g: number
          fiber_per_100g: number
          id: number
          name: string
          protein_per_100g: number
        }
        Insert: {
          calories_per_100g: number
          carbs_per_100g: number
          category: string
          fats_per_100g: number
          fiber_per_100g: number
          id?: number
          name: string
          protein_per_100g: number
        }
        Update: {
          calories_per_100g?: number
          carbs_per_100g?: number
          category?: string
          fats_per_100g?: number
          fiber_per_100g?: number
          id?: number
          name?: string
          protein_per_100g?: number
        }
        Relationships: []
      }
      goals: {
        Row: {
          achieved: boolean | null
          created_at: string | null
          deadline: string | null
          id: string
          target: number
          type: string
          unit: string
          user_id: string | null
        }
        Insert: {
          achieved?: boolean | null
          created_at?: string | null
          deadline?: string | null
          id?: string
          target: number
          type: string
          unit: string
          user_id?: string | null
        }
        Update: {
          achieved?: boolean | null
          created_at?: string | null
          deadline?: string | null
          id?: string
          target?: number
          type?: string
          unit?: string
          user_id?: string | null
        }
        Relationships: []
      }
      meal_ingredients: {
        Row: {
          created_at: string | null
          food_id: number | null
          id: string
          meal_id: string | null
          quantity_grams: number
        }
        Insert: {
          created_at?: string | null
          food_id?: number | null
          id?: string
          meal_id?: string | null
          quantity_grams: number
        }
        Update: {
          created_at?: string | null
          food_id?: number | null
          id?: string
          meal_id?: string | null
          quantity_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_ingredients_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods_free"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_ingredients_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meal_nutrition"
            referencedColumns: ["meal_id"]
          },
          {
            foreignKeyName: "meal_ingredients_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          created_at: string | null
          diet_plan_id: string | null
          id: string
          instructions: string | null
          meal_time: string | null
          meal_type: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          diet_plan_id?: string | null
          id?: string
          instructions?: string | null
          meal_time?: string | null
          meal_type?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          diet_plan_id?: string | null
          id?: string
          instructions?: string | null
          meal_time?: string | null
          meal_type?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meals_diet_plan_id_fkey"
            columns: ["diet_plan_id"]
            isOneToOne: false
            referencedRelation: "diet_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          id: string
          is_read: boolean | null
          title: string
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      progress_photos: {
        Row: {
          description: string | null
          id: string
          photo_type: string | null
          photo_url: string
          taken_at: string | null
          user_id: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          photo_type?: string | null
          photo_url: string
          taken_at?: string | null
          user_id?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          photo_type?: string | null
          photo_url?: string
          taken_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      progress_timeline: {
        Row: {
          achieved_at: string | null
          achievement_id: string | null
          description: string | null
          id: string
          milestone_type: string | null
          milestone_value: number | null
          progress_percentage: number | null
          user_id: string | null
        }
        Insert: {
          achieved_at?: string | null
          achievement_id?: string | null
          description?: string | null
          id?: string
          milestone_type?: string | null
          milestone_value?: number | null
          progress_percentage?: number | null
          user_id?: string | null
        }
        Update: {
          achieved_at?: string | null
          achievement_id?: string | null
          description?: string | null
          id?: string
          milestone_type?: string | null
          milestone_value?: number | null
          progress_percentage?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_timeline_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: string[] | null
          id: string
          name: string
          price_monthly: number
          stripe_price_id: string
          stripe_product_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          name: string
          price_monthly: number
          stripe_price_id: string
          stripe_product_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          name?: string
          price_monthly?: number
          stripe_price_id?: string
          stripe_product_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string | null
          awarded_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          achievement_id?: string | null
          awarded_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          achievement_id?: string | null
          awarded_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goals: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          current_value: number | null
          goal_description: string | null
          goal_name: string
          goal_type: string | null
          id: string
          progress_percentage: number | null
          start_date: string
          start_value: number | null
          target_date: string | null
          target_value: number | null
          unit: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          goal_description?: string | null
          goal_name: string
          goal_type?: string | null
          id?: string
          progress_percentage?: number | null
          start_date: string
          start_value?: number | null
          target_date?: string | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          goal_description?: string | null
          goal_name?: string
          goal_type?: string | null
          id?: string
          progress_percentage?: number | null
          start_date?: string
          start_value?: number | null
          target_date?: string | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_hydration_goals: {
        Row: {
          created_at: string | null
          daily_target_ml: number
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          daily_target_ml?: number
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          daily_target_ml?: number
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          created_at: string
          gender: string | null
          goal: string | null
          height: number | null
          id: string
          target_weight: number | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          gender?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          target_weight?: number | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          gender?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          target_weight?: number | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string
          current_level: number | null
          id: string
          max_streak_days: number | null
          meals_logged: number | null
          photos_uploaded: number | null
          streak_days: number | null
          total_points: number | null
          updated_at: string
          user_id: string
          weight_logs_count: number | null
          workouts_completed: number | null
        }
        Insert: {
          created_at?: string
          current_level?: number | null
          id?: string
          max_streak_days?: number | null
          meals_logged?: number | null
          photos_uploaded?: number | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string
          user_id: string
          weight_logs_count?: number | null
          workouts_completed?: number | null
        }
        Update: {
          created_at?: string
          current_level?: number | null
          id?: string
          max_streak_days?: number | null
          meals_logged?: number | null
          photos_uploaded?: number | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string
          user_id?: string
          weight_logs_count?: number | null
          workouts_completed?: number | null
        }
        Relationships: []
      }
      user_step_goals: {
        Row: {
          created_at: string | null
          daily_target_steps: number
          id: string
          updated_at: string | null
          user_id: string
          weekly_target_steps: number
        }
        Insert: {
          created_at?: string | null
          daily_target_steps?: number
          id?: string
          updated_at?: string | null
          user_id: string
          weekly_target_steps?: number
        }
        Update: {
          created_at?: string | null
          daily_target_steps?: number
          id?: string
          updated_at?: string | null
          user_id?: string
          weekly_target_steps?: number
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string | null
          current_count: number
          id: string
          last_activity_date: string | null
          longest_count: number
          streak_start_date: string | null
          streak_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_count?: number
          id?: string
          last_activity_date?: string | null
          longest_count?: number
          streak_start_date?: string | null
          streak_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_count?: number
          id?: string
          last_activity_date?: string | null
          longest_count?: number
          streak_start_date?: string | null
          streak_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          id: string
          plan_id: string | null
          status: string
          stripe_subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          plan_id?: string | null
          status: string
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      water_logs: {
        Row: {
          amount_ml: number
          created_at: string | null
          id: string
          logged_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_ml: number
          created_at?: string | null
          id?: string
          logged_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string | null
          id?: string
          logged_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          id: string
          logged_at: string | null
          user_id: string | null
          weight: number
        }
        Insert: {
          id?: string
          logged_at?: string | null
          user_id?: string | null
          weight: number
        }
        Update: {
          id?: string
          logged_at?: string | null
          user_id?: string | null
          weight?: number
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          exercise_id: string | null
          exercise_order: number | null
          id: string
          notes: string | null
          reps: number | null
          rest_seconds: number | null
          sets: number | null
          weight_kg: number | null
          workout_session_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          exercise_id?: string | null
          exercise_order?: number | null
          id?: string
          notes?: string | null
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
          weight_kg?: number | null
          workout_session_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          exercise_id?: string | null
          exercise_order?: number | null
          id?: string
          notes?: string | null
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
          weight_kg?: number | null
          workout_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_session_details"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          calories_burned: number | null
          completed_at: string | null
          duration_seconds: number | null
          exercise_id: string | null
          id: string
          notes: string | null
          reps_completed: number | null
          sets_completed: number | null
          user_id: string | null
          weight_used: number | null
          workout_session_id: string | null
        }
        Insert: {
          calories_burned?: number | null
          completed_at?: string | null
          duration_seconds?: number | null
          exercise_id?: string | null
          id?: string
          notes?: string | null
          reps_completed?: number | null
          sets_completed?: number | null
          user_id?: string | null
          weight_used?: number | null
          workout_session_id?: string | null
        }
        Update: {
          calories_burned?: number | null
          completed_at?: string | null
          duration_seconds?: number | null
          exercise_id?: string | null
          id?: string
          notes?: string | null
          reps_completed?: number | null
          sets_completed?: number | null
          user_id?: string | null
          weight_used?: number | null
          workout_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_session_details"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "workout_logs_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty_level: number | null
          duration_weeks: number | null
          goal: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          duration_weeks?: number | null
          goal?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          duration_weeks?: number | null
          goal?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          rest_day: boolean | null
          session_order: number | null
          workout_plan_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          rest_day?: boolean | null
          session_order?: number | null
          workout_plan_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          rest_day?: boolean | null
          session_order?: number | null
          workout_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      daily_water_summary: {
        Row: {
          first_log: string | null
          last_log: string | null
          log_count: number | null
          log_date: string | null
          total_ml: number | null
          user_id: string | null
        }
        Relationships: []
      }
      dashboard_streaks: {
        Row: {
          best_login_streak: number | null
          best_overall_streak: number | null
          best_workout_streak: number | null
          login_streak: number | null
          overall_streak: number | null
          user_id: string | null
          workout_streak: number | null
        }
        Relationships: []
      }
      meal_nutrition: {
        Row: {
          day_of_week: number | null
          diet_plan_name: string | null
          meal_date: string | null
          meal_id: string | null
          meal_name: string | null
          meal_type: string | null
          total_calories: number | null
          total_carbs: number | null
          total_fats: number | null
          total_fiber: number | null
          total_protein: number | null
          user_id: string | null
        }
        Relationships: []
      }
      recent_daily_steps: {
        Row: {
          completion_percentage: number | null
          daily_target: number | null
          data_source: string | null
          recorded_date: string | null
          step_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
      weekly_steps_summary: {
        Row: {
          avg_daily_steps: number | null
          days_recorded: number | null
          max_daily_steps: number | null
          min_daily_steps: number | null
          total_steps: number | null
          user_id: string | null
          week_start: string | null
        }
        Relationships: []
      }
      workout_session_details: {
        Row: {
          plan_name: string | null
          session_description: string | null
          session_id: string | null
          session_name: string | null
          session_order: number | null
          total_exercises: number | null
          total_volume: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_achievement: {
        Args: { p_user_id: string; p_achievement_code: string }
        Returns: boolean
      }
      calculate_bmi: {
        Args: { weight_kg: number; height_cm: number }
        Returns: number
      }
      calculate_progress_percentage: {
        Args: {
          current_value: number
          start_value: number
          target_value: number
        }
        Returns: number
      }
      get_bmi_category: {
        Args: { bmi: number }
        Returns: string
      }
      get_weekly_activity_summary: {
        Args: { p_user_id: string }
        Returns: {
          day_name: string
          workouts: number
          duration: number
          is_active: boolean
        }[]
      }
      update_daily_activity_stats: {
        Args: {
          p_user_id: string
          p_date?: string
          p_workout_duration?: number
          p_steps?: number
          p_calories?: number
        }
        Returns: undefined
      }
      update_user_stats: {
        Args: {
          p_user_id: string
          p_meals_logged?: number
          p_workouts_completed?: number
          p_streak_days?: number
          p_weight_logs_count?: number
          p_photos_uploaded?: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
