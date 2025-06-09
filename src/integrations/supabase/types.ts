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
      profiles: {
        Row: {
          age: string | null
          availability: string | null
          bio: string | null
          body_type: string | null
          created_at: string
          cup_size: string | null
          display_name: string | null
          drinking: string | null
          email: string | null
          ethnicity: string | null
          eye_color: string | null
          featured: boolean | null
          gallery_images: string[] | null
          hair_color: string | null
          height: string | null
          id: string
          is_active: boolean | null
          languages: string | null
          last_active: string | null
          location: string | null
          nationality: string | null
          payment_status: string | null
          piercings: boolean | null
          profile_picture: string | null
          rates: string | null
          rating: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          services: string | null
          smoking: string | null
          status: string | null
          tags: string | null
          tattoos: boolean | null
          updated_at: string
          username: string | null
          verified: boolean | null
          view_count: number | null
          weight: string | null
        }
        Insert: {
          age?: string | null
          availability?: string | null
          bio?: string | null
          body_type?: string | null
          created_at?: string
          cup_size?: string | null
          display_name?: string | null
          drinking?: string | null
          email?: string | null
          ethnicity?: string | null
          eye_color?: string | null
          featured?: boolean | null
          gallery_images?: string[] | null
          hair_color?: string | null
          height?: string | null
          id: string
          is_active?: boolean | null
          languages?: string | null
          last_active?: string | null
          location?: string | null
          nationality?: string | null
          payment_status?: string | null
          piercings?: boolean | null
          profile_picture?: string | null
          rates?: string | null
          rating?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          services?: string | null
          smoking?: string | null
          status?: string | null
          tags?: string | null
          tattoos?: boolean | null
          updated_at?: string
          username?: string | null
          verified?: boolean | null
          view_count?: number | null
          weight?: string | null
        }
        Update: {
          age?: string | null
          availability?: string | null
          bio?: string | null
          body_type?: string | null
          created_at?: string
          cup_size?: string | null
          display_name?: string | null
          drinking?: string | null
          email?: string | null
          ethnicity?: string | null
          eye_color?: string | null
          featured?: boolean | null
          gallery_images?: string[] | null
          hair_color?: string | null
          height?: string | null
          id?: string
          is_active?: boolean | null
          languages?: string | null
          last_active?: string | null
          location?: string | null
          nationality?: string | null
          payment_status?: string | null
          piercings?: boolean | null
          profile_picture?: string | null
          rates?: string | null
          rating?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          services?: string | null
          smoking?: string | null
          status?: string | null
          tags?: string | null
          tattoos?: boolean | null
          updated_at?: string
          username?: string | null
          verified?: boolean | null
          view_count?: number | null
          weight?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          expires_at: string | null
          id: string
          is_featured: boolean | null
          photo_verified: boolean | null
          plan_duration: string | null
          plan_price: number | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          subscription_type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          is_featured?: boolean | null
          photo_verified?: boolean | null
          plan_duration?: string | null
          plan_price?: number | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          subscription_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          is_featured?: boolean | null
          photo_verified?: boolean | null
          plan_duration?: string | null
          plan_price?: number | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          subscription_type?: string | null
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
      is_admin: {
        Args: { user_id: string }
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
