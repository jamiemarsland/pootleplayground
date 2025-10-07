import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
}
