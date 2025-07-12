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
          code: string
          description: string | null
          icon: string | null
          id: string
          title: string
        }
        Insert: {
          code: string
          description?: string | null
          icon?: string | null
          id?: string
          title: string
        }
        Update: {
          code?: string
          description?: string | null
          icon?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      diet_plans: {
        Row: {
          created_at: string
          description: string | null
          duration_days: number | null
          id: string
          is_active: boolean | null
          name: string
          target_calories: number | null
          target_carbs: number | null
          target_fats: number | null
          target_protein: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          target_calories?: number | null
          target_carbs?: number | null
          target_fats?: number | null
          target_protein?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          target_calories?: number | null
          target_carbs?: number | null
          target_fats?: number | null
          target_protein?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          category: string | null
          created_at: string
          difficulty_level: string | null
          equipment_needed: string | null
          id: string
          instructions: string | null
          muscle_group: string | null
          name: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          difficulty_level?: string | null
          equipment_needed?: string | null
          id?: string
          instructions?: string | null
          muscle_group?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          difficulty_level?: string | null
          equipment_needed?: string | null
          id?: string
          instructions?: string | null
          muscle_group?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          food_id: string
          id: string
          logged_at: string
          meal_type: string | null
          quantity_grams: number
          user_id: string
        }
        Insert: {
          food_id: string
          id?: string
          logged_at?: string
          meal_type?: string | null
          quantity_grams: number
          user_id: string
        }
        Update: {
          food_id?: string
          id?: string
          logged_at?: string
          meal_type?: string | null
          quantity_grams?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_logs_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          calories_per_100g: number
          carbs_per_100g: number | null
          category: string | null
          created_at: string
          fats_per_100g: number | null
          fiber_per_100g: number | null
          id: string
          name: string
          protein_per_100g: number | null
          sodium_per_100g: number | null
          updated_at: string
        }
        Insert: {
          calories_per_100g: number
          carbs_per_100g?: number | null
          category?: string | null
          created_at?: string
          fats_per_100g?: number | null
          fiber_per_100g?: number | null
          id?: string
          name: string
          protein_per_100g?: number | null
          sodium_per_100g?: number | null
          updated_at?: string
        }
        Update: {
          calories_per_100g?: number
          carbs_per_100g?: number | null
          category?: string | null
          created_at?: string
          fats_per_100g?: number | null
          fiber_per_100g?: number | null
          id?: string
          name?: string
          protein_per_100g?: number | null
          sodium_per_100g?: number | null
          updated_at?: string
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
          created_at: string
          food_id: string
          id: string
          meal_id: string
          quantity_grams: number
        }
        Insert: {
          created_at?: string
          food_id: string
          id?: string
          meal_id: string
          quantity_grams: number
        }
        Update: {
          created_at?: string
          food_id?: string
          id?: string
          meal_id?: string
          quantity_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_ingredients_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
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
          created_at: string
          day_of_week: number | null
          diet_plan_id: string
          id: string
          instructions: string | null
          meal_time: string | null
          meal_type: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week?: number | null
          diet_plan_id: string
          id?: string
          instructions?: string | null
          meal_time?: string | null
          meal_type?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number | null
          diet_plan_id?: string
          id?: string
          instructions?: string | null
          meal_time?: string | null
          meal_type?: string | null
          name?: string
          updated_at?: string
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
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          price_monthly: number
          stripe_price_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          price_monthly: number
          stripe_price_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          price_monthly?: number
          stripe_price_id?: string
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
          created_at: string
          current_value: number | null
          goal_type: string
          id: string
          is_achieved: boolean | null
          target_date: string | null
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          goal_type: string
          id?: string
          is_achieved?: boolean | null
          target_date?: string | null
          target_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          goal_type?: string
          id?: string
          is_achieved?: boolean | null
          target_date?: string | null
          target_value?: number
          updated_at?: string
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
      weight_logs: {
        Row: {
          body_fat_percentage: number | null
          id: string
          logged_at: string
          muscle_mass_kg: number | null
          notes: string | null
          user_id: string
          weight_kg: number
        }
        Insert: {
          body_fat_percentage?: number | null
          id?: string
          logged_at?: string
          muscle_mass_kg?: number | null
          notes?: string | null
          user_id: string
          weight_kg: number
        }
        Update: {
          body_fat_percentage?: number | null
          id?: string
          logged_at?: string
          muscle_mass_kg?: number | null
          notes?: string | null
          user_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string
          duration_seconds: number | null
          exercise_id: string
          id: string
          order_index: number
          reps: number | null
          rest_seconds: number | null
          session_id: string
          sets: number | null
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          exercise_id: string
          id?: string
          order_index: number
          reps?: number | null
          rest_seconds?: number | null
          session_id: string
          sets?: number | null
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          exercise_id?: string
          id?: string
          order_index?: number
          reps?: number | null
          rest_seconds?: number | null
          session_id?: string
          sets?: number | null
          weight_kg?: number | null
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
            foreignKeyName: "workout_exercises_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_session_details"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "workout_exercises_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          duration_minutes: number | null
          exercise_id: string
          id: string
          logged_at: string
          notes: string | null
          reps_completed: number | null
          sets_completed: number | null
          user_id: string
          weight_used_kg: number | null
          workout_session_id: string | null
        }
        Insert: {
          duration_minutes?: number | null
          exercise_id: string
          id?: string
          logged_at?: string
          notes?: string | null
          reps_completed?: number | null
          sets_completed?: number | null
          user_id: string
          weight_used_kg?: number | null
          workout_session_id?: string | null
        }
        Update: {
          duration_minutes?: number | null
          exercise_id?: string
          id?: string
          logged_at?: string
          notes?: string | null
          reps_completed?: number | null
          sets_completed?: number | null
          user_id?: string
          weight_used_kg?: number | null
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
          created_at: string
          description: string | null
          difficulty_level: string | null
          duration_weeks: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          user_id: string
          workouts_per_week: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_weeks?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          user_id: string
          workouts_per_week?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_weeks?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
          workouts_per_week?: number | null
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          created_at: string
          day_of_week: number | null
          estimated_duration_minutes: number | null
          id: string
          name: string
          updated_at: string
          workout_plan_id: string
        }
        Insert: {
          created_at?: string
          day_of_week?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          name: string
          updated_at?: string
          workout_plan_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          name?: string
          updated_at?: string
          workout_plan_id?: string
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
      meal_nutrition: {
        Row: {
          day_of_week: number | null
          diet_plan_name: string | null
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
      workout_session_details: {
        Row: {
          day_of_week: number | null
          estimated_duration_minutes: number | null
          session_id: string | null
          session_name: string | null
          total_exercises: number | null
          total_reps: number | null
          user_id: string | null
          workout_plan_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
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
