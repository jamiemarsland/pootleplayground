import { createClient } from '@supabase/supabase-js';
import { getUserId } from '../utils/userManager';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'x-user-id': getUserId()
    }
  }
});

export interface BlueprintRecord {
  id: string;
  title: string;
  description: string;
  blueprint_data: {
    version: string;
    blueprintTitle: string;
    landingPageType: string;
    steps: any[];
  };
  landing_page_type: string;
  step_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  votes: number;
  user_id: string;
}
