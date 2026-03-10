import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return apiError('No file provided', 400, 'NO_FILE');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return apiError('Invalid file type. Only JPG, PNG, and PDF are allowed.', 400, 'INVALID_TYPE');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return apiError('File size exceeds 5MB limit', 400, 'FILE_TOO_LARGE');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const fileName = `cnic_${timestamp}_${randomString}.${fileExt}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('vendor-documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('[Upload CNIC] Storage error:', error);
      return apiError('Failed to upload file', 500);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('vendor-documents')
      .getPublicUrl(fileName);

    return apiSuccess({
      url: urlData.publicUrl,
      fileName: fileName,
    }, 'File uploaded successfully');
  } catch (err) {
    console.error('[Upload CNIC] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
