export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          code: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          xp_reward: number
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          xp_reward?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          xp_reward?: number
        }
        Relationships: []
      }
      guidance_reports: {
        Row: {
          created_at: string
          id: string
          phase: number
          recommended: string
          roadmap: Json
          scores: Json
          summary: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          phase?: number
          recommended: string
          roadmap: Json
          scores: Json
          summary: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          phase?: number
          recommended?: string
          roadmap?: Json
          scores?: Json
          summary?: string
          user_id?: string
        }
        Relationships: []
      }
      hackathons: {
        Row: {
          created_at: string
          description: string | null
          event_end_date: string | null
          event_start_date: string | null
          id: string
          is_active: boolean
          location: string | null
          mode: string
          organizer: string
          prize: string | null
          registration_deadline: string | null
          source: string
          tags: string[]
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_end_date?: string | null
          event_start_date?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          mode?: string
          organizer: string
          prize?: string | null
          registration_deadline?: string | null
          source?: string
          tags?: string[]
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_end_date?: string | null
          event_start_date?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          mode?: string
          organizer?: string
          prize?: string | null
          registration_deadline?: string | null
          source?: string
          tags?: string[]
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      hr_interview_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_interview_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "hr_interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_interview_sessions: {
        Row: {
          difficulty: string
          ended_at: string | null
          feedback: Json | null
          id: string
          role_target: string
          score: number | null
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          difficulty?: string
          ended_at?: string | null
          feedback?: Json | null
          id?: string
          role_target: string
          score?: number | null
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          difficulty?: string
          ended_at?: string | null
          feedback?: Json | null
          id?: string
          role_target?: string
          score?: number | null
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      interest_responses: {
        Row: {
          answers: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          answers: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      internships: {
        Row: {
          active: boolean
          apply_url: string
          company: string
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          location: string | null
          mode: string | null
          skills: string[]
          source: string | null
          stipend: string | null
          title: string
          verified: boolean
        }
        Insert: {
          active?: boolean
          apply_url: string
          company: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          location?: string | null
          mode?: string | null
          skills?: string[]
          source?: string | null
          stipend?: string | null
          title: string
          verified?: boolean
        }
        Update: {
          active?: boolean
          apply_url?: string
          company?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          location?: string | null
          mode?: string | null
          skills?: string[]
          source?: string | null
          stipend?: string | null
          title?: string
          verified?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          branch: string | null
          cgpa: number | null
          college: string | null
          created_at: string
          full_name: string | null
          id: string
          onboarded: boolean
          semester: number | null
          updated_at: string
          year: number | null
        }
        Insert: {
          branch?: string | null
          cgpa?: number | null
          college?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          onboarded?: boolean
          semester?: number | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          branch?: string | null
          cgpa?: number | null
          college?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          onboarded?: boolean
          semester?: number | null
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_idx: number
          difficulty: string
          explanation: string | null
          id: string
          options: Json
          prompt: string
          subject_id: string | null
          topic_id: string | null
        }
        Insert: {
          correct_idx: number
          difficulty: string
          explanation?: string | null
          id?: string
          options: Json
          prompt: string
          subject_id?: string | null
          topic_id?: string | null
        }
        Update: {
          correct_idx?: number
          difficulty?: string
          explanation?: string | null
          id?: string
          options?: Json
          prompt?: string
          subject_id?: string | null
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_responses: {
        Row: {
          chosen_idx: number
          created_at: string
          id: string
          is_correct: boolean
          question_id: string
          session_id: string
          user_id: string
        }
        Insert: {
          chosen_idx: number
          created_at?: string
          id?: string
          is_correct: boolean
          question_id: string
          session_id: string
          user_id: string
        }
        Update: {
          chosen_idx?: number
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_sessions: {
        Row: {
          finished_at: string | null
          id: string
          score: number | null
          started_at: string
          subject_id: string | null
          topic_id: string | null
          total: number | null
          user_id: string
        }
        Insert: {
          finished_at?: string | null
          id?: string
          score?: number | null
          started_at?: string
          subject_id?: string | null
          topic_id?: string | null
          total?: number | null
          user_id: string
        }
        Update: {
          finished_at?: string | null
          id?: string
          score?: number | null
          started_at?: string
          subject_id?: string | null
          topic_id?: string | null
          total?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          channel: string | null
          duration_min: number | null
          id: string
          kind: string
          language: string
          title: string
          topic_id: string
          youtube_id: string | null
        }
        Insert: {
          channel?: string | null
          duration_min?: number | null
          id?: string
          kind?: string
          language?: string
          title: string
          topic_id: string
          youtube_id?: string | null
        }
        Update: {
          channel?: string | null
          duration_min?: number | null
          id?: string
          kind?: string
          language?: string
          title?: string
          topic_id?: string
          youtube_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          ai_summary: string | null
          content: Json
          created_at: string
          id: string
          target_role: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          content?: Json
          created_at?: string
          id?: string
          target_role?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          content?: Json
          created_at?: string
          id?: string
          target_role?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      semesters: {
        Row: {
          description: string | null
          id: number
          name: string
        }
        Insert: {
          description?: string | null
          id: number
          name: string
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      student_internships: {
        Row: {
          bookmarked: boolean
          internship_id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bookmarked?: boolean
          internship_id: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bookmarked?: boolean
          internship_id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_internships_internship_id_fkey"
            columns: ["internship_id"]
            isOneToOne: false
            referencedRelation: "internships"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          position: number
          semester_id: number
        }
        Insert: {
          code?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          position?: number
          semester_id: number
        }
        Update: {
          code?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          position?: number
          semester_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "subjects_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_progress: {
        Row: {
          status: string
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          status?: string
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          status?: string
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          id: string
          name: string
          position: number
          summary: string | null
          unit_id: string
        }
        Insert: {
          id?: string
          name: string
          position?: number
          summary?: string | null
          unit_id: string
        }
        Update: {
          id?: string
          name?: string
          position?: number
          summary?: string | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          id: string
          name: string
          position: number
          subject_id: string
        }
        Insert: {
          id?: string
          name: string
          position?: number
          subject_id: string
        }
        Update: {
          id?: string
          name?: string
          position?: number
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_skills: {
        Row: {
          created_at: string
          id: string
          proficiency: string
          skill: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          proficiency: string
          skill: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          proficiency?: string
          skill?: string
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string
          current_streak: number
          last_active_date: string | null
          level: number
          longest_streak: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          current_streak?: number
          last_active_date?: string | null
          level?: number
          longest_streak?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          current_streak?: number
          last_active_date?: string | null
          level?: number
          longest_streak?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
