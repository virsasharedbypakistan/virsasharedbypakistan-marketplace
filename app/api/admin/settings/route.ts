import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole } from '@/lib/api-helpers';
import { z } from 'zod';

// ── GET /api/admin/settings — Fetch all platform settings ────────────

export async function GET() {
  try {
    const authResult = await requireRole('admin');
    if ('error' in authResult) return authResult.error;

    const { data, error } = await supabaseAdmin
      .from('platform_settings')
      .select('key, value, description, updated_at')
      .order('key');

    if (error) {
      console.error('[Admin Settings GET] Error:', error);
      return apiError('Failed to fetch settings', 500);
    }

    // Transform array of {key, value} into a flat object for easy consumption
    const settings: Record<string, string> = {};
    data?.forEach((row) => {
      settings[row.key] = row.value;
    });

    return apiSuccess(settings);
  } catch (err) {
    console.error('[Admin Settings GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── PATCH /api/admin/settings — Update one or more platform settings ─

const updateSettingsSchema = z.record(z.string(), z.string());

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireRole('admin');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const body = await request.json();
    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Invalid settings payload', 400, 'VALIDATION_ERROR');
    }

    const updates = parsed.data;

    // Upsert each key-value pair
    const upsertRows = Object.entries(updates).map(([key, value]) => ({
      key,
      value,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabaseAdmin
      .from('platform_settings')
      .upsert(upsertRows, { onConflict: 'key' });

    if (error) {
      console.error('[Admin Settings PATCH] Error:', error);
      return apiError('Failed to save settings', 500);
    }

    return apiSuccess(null, 'Settings saved successfully');
  } catch (err) {
    console.error('[Admin Settings PATCH] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
