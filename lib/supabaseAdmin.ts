import { createClient } from '@supabase/supabase-js';

// Primary Supabase project (admin client - server-side only)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Backup Supabase project (admin client - server-side only)
export const supabaseBackup = createClient(
  process.env.SUPABASE_BACKUP_URL!,
  process.env.SUPABASE_BACKUP_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
