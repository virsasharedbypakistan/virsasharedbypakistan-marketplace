import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireAuth } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const BUCKET_NAME = 'uploads';

// ── POST /api/upload — File upload to Supabase Storage ──────────────

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    // Rate limit
    const { success: allowed } = await mutationRateLimit.limit(user.id);
    if (!allowed) {
      return apiError('Too many requests. Try again later.', 429, 'RATE_LIMITED');
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return apiError('No file provided', 400, 'NO_FILE');
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return apiError(
        `Invalid file type: ${file.type}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
        400,
        'INVALID_FILE_TYPE'
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return apiError(
        `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        400,
        'FILE_TOO_LARGE'
      );
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const filePath = `${folder}/${user.id}/${timestamp}-${randomSuffix}.${ext}`;

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[Upload] Storage error:', uploadError);
      return apiError('Failed to upload file', 500, 'UPLOAD_FAILED');
    }

    // Get public URL
    const { data: publicUrl } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return apiSuccess(
      {
        url: publicUrl.publicUrl,
        path: filePath,
        filename: file.name,
        size: file.size,
        type: file.type,
      },
      'File uploaded successfully',
      201
    );
  } catch (err) {
    console.error('[Upload] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
