import { supabaseAdmin, supabaseBackup } from '@/lib/supabaseAdmin';
import { apiSuccess } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const timestamp = new Date().toISOString();
  const services: Record<string, 'up' | 'down'> = {
    supabase_primary: 'down',
    supabase_backup: 'down',
  };

  // Check Supabase Primary
  try {
    const { error } = await supabaseAdmin.from('platform_settings').select('key').limit(1);
    services.supabase_primary = error ? 'down' : 'up';
  } catch {
    services.supabase_primary = 'down';
  }

  // Check Supabase Backup
  try {
    const { error } = await supabaseBackup.from('platform_settings').select('key').limit(1);
    services.supabase_backup = error ? 'down' : 'up';
  } catch {
    services.supabase_backup = 'down';
  }

  // Determine overall status
  let status: 'ok' | 'degraded_primary_down' | 'critical' = 'ok';
  if (services.supabase_primary === 'down' && services.supabase_backup === 'down') {
    status = 'critical';
  } else if (services.supabase_primary === 'down') {
    status = 'degraded_primary_down';
  }

  return apiSuccess({ status, timestamp, services });
}
