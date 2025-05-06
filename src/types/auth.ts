
import { Database } from '@/integrations/supabase/types';
import { User } from '@supabase/supabase-js';

export type UserRole = Database['public']['Enums']['user_role'];

export interface UserProfile {
  id: string;
  role: UserRole;
  display_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, role: UserRole) => Promise<{
    error: Error | null;
    data: any;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any;
  }>;
  signOut: () => Promise<void>;
}
