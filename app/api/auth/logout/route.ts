import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[Logout] Error:', error);
      return apiError('Logout failed', 500);
    }

    return apiSuccess(null, 'Logged out successfully');
  } catch (err) {
    console.error('[Logout] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE() {
  return POST();
}
