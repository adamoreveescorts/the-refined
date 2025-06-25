export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agency_escorts: {
        Row: {
          agency_id: string
          created_at: string
          escort_id: string
          id: string
          invited_at: string
          joined_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          escort_id: string
          id?: string
          invited_at?: string
          joined_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          escort_id?: string
          id?: string
          invited_at?: string
          joined_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_escorts_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_escorts_escort_id_fkey"
            columns: ["escort_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_subscriptions: {
        Row: {
          agency_id: string
          billing_cycle: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          price_per_seat: number
          status: string
          stripe_subscription_id: string | null
          subscription_tier: string
          total_seats: number
          updated_at: string
          used_seats: number
        }
        Insert: {
          agency_id: string
          billing_cycle?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          price_per_seat: number
          status?: string
          stripe_subscription_id?: string | null
          subscription_tier?: string
          total_seats?: number
          updated_at?: string
          used_seats?: number
        }
        Update: {
          agency_id?: string
          billing_cycle?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          price_per_seat?: number
          status?: string
          stripe_subscription_id?: string | null
          subscription_tier?: string
          total_seats?: number
          updated_at?: string
          used_seats?: number
        }
        Relationships: [
          {
            foreignKeyName: "agency_subscriptions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          client_id: string
          created_at: string
          escort_id: string
          id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          escort_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          escort_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_escort_id_fkey"
            columns: ["escort_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      escort_invitations: {
        Row: {
          accepted_at: string | null
          agency_id: string
          created_at: string
          display_name: string | null
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_at: string
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          agency_id: string
          created_at?: string
          display_name?: string | null
          email: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          agency_id?: string
          created_at?: string
          display_name?: string | null
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escort_invitations_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          admin_reply: boolean | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          admin_reply?: boolean | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          admin_reply?: boolean | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_verifications: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          profile_photo_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          updated_at: string
          user_id: string
          verification_photo_url: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          profile_photo_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id: string
          verification_photo_url: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          profile_photo_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string
          verification_photo_url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: string | null
          agency_id: string | null
          availability: string | null
          bio: string | null
          body_type: string | null
          created_at: string
          cup_size: string | null
          dinner_rate: string | null
          display_name: string | null
          drinking: string | null
          email: string | null
          ethnicity: string | null
          eye_color: string | null
          featured: boolean | null
          gallery_images: string[] | null
          hair_color: string | null
          height: string | null
          hourly_rate: string | null
          id: string
          incall_dinner_rate: string | null
          incall_hourly_rate: string | null
          incall_overnight_rate: string | null
          incall_two_hour_rate: string | null
          is_active: boolean | null
          languages: string | null
          last_active: string | null
          location: string | null
          nationality: string | null
          outcall_dinner_rate: string | null
          outcall_hourly_rate: string | null
          outcall_overnight_rate: string | null
          outcall_two_hour_rate: string | null
          overnight_rate: string | null
          payment_status: string | null
          piercings: boolean | null
          profile_completion_percentage: number | null
          profile_picture: string | null
          rates: string | null
          rating: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          services: string | null
          setup_completed: boolean | null
          setup_step_completed: Json | null
          smoking: string | null
          status: string | null
          tags: string | null
          tattoos: boolean | null
          two_hour_rate: string | null
          updated_at: string
          username: string | null
          verified: boolean | null
          view_count: number | null
          weight: string | null
        }
        Insert: {
          age?: string | null
          agency_id?: string | null
          availability?: string | null
          bio?: string | null
          body_type?: string | null
          created_at?: string
          cup_size?: string | null
          dinner_rate?: string | null
          display_name?: string | null
          drinking?: string | null
          email?: string | null
          ethnicity?: string | null
          eye_color?: string | null
          featured?: boolean | null
          gallery_images?: string[] | null
          hair_color?: string | null
          height?: string | null
          hourly_rate?: string | null
          id: string
          incall_dinner_rate?: string | null
          incall_hourly_rate?: string | null
          incall_overnight_rate?: string | null
          incall_two_hour_rate?: string | null
          is_active?: boolean | null
          languages?: string | null
          last_active?: string | null
          location?: string | null
          nationality?: string | null
          outcall_dinner_rate?: string | null
          outcall_hourly_rate?: string | null
          outcall_overnight_rate?: string | null
          outcall_two_hour_rate?: string | null
          overnight_rate?: string | null
          payment_status?: string | null
          piercings?: boolean | null
          profile_completion_percentage?: number | null
          profile_picture?: string | null
          rates?: string | null
          rating?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          services?: string | null
          setup_completed?: boolean | null
          setup_step_completed?: Json | null
          smoking?: string | null
          status?: string | null
          tags?: string | null
          tattoos?: boolean | null
          two_hour_rate?: string | null
          updated_at?: string
          username?: string | null
          verified?: boolean | null
          view_count?: number | null
          weight?: string | null
        }
        Update: {
          age?: string | null
          agency_id?: string | null
          availability?: string | null
          bio?: string | null
          body_type?: string | null
          created_at?: string
          cup_size?: string | null
          dinner_rate?: string | null
          display_name?: string | null
          drinking?: string | null
          email?: string | null
          ethnicity?: string | null
          eye_color?: string | null
          featured?: boolean | null
          gallery_images?: string[] | null
          hair_color?: string | null
          height?: string | null
          hourly_rate?: string | null
          id?: string
          incall_dinner_rate?: string | null
          incall_hourly_rate?: string | null
          incall_overnight_rate?: string | null
          incall_two_hour_rate?: string | null
          is_active?: boolean | null
          languages?: string | null
          last_active?: string | null
          location?: string | null
          nationality?: string | null
          outcall_dinner_rate?: string | null
          outcall_hourly_rate?: string | null
          outcall_overnight_rate?: string | null
          outcall_two_hour_rate?: string | null
          overnight_rate?: string | null
          payment_status?: string | null
          piercings?: boolean | null
          profile_completion_percentage?: number | null
          profile_picture?: string | null
          rates?: string | null
          rating?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          services?: string | null
          setup_completed?: boolean | null
          setup_step_completed?: Json | null
          smoking?: string | null
          status?: string | null
          tags?: string | null
          tattoos?: boolean | null
          two_hour_rate?: string | null
          updated_at?: string
          username?: string | null
          verified?: boolean | null
          view_count?: number | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          expires_at: string | null
          id: string
          is_featured: boolean | null
          is_trial_active: boolean | null
          photo_verified: boolean | null
          plan_duration: string | null
          plan_price: number | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          subscription_type: string | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_trial_active?: boolean | null
          photo_verified?: boolean | null
          plan_duration?: string | null
          plan_price?: number | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          subscription_type?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_trial_active?: boolean | null
          photo_verified?: boolean | null
          plan_duration?: string | null
          plan_price?: number | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          subscription_type?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_profile_completion: {
        Args: { profile_id: string }
        Returns: number
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_agency: {
        Args: { user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "escort" | "client" | "agency" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["escort", "client", "agency", "admin"],
    },
  },
} as const
