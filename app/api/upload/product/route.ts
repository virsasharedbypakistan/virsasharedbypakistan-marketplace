import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole, getVendorForUser } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRole('vendor');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    // Get vendor
    const vendor = await getVendorForUser(user.id);
    if (!vendor) {
      return apiError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return apiError('No file provided', 400, 'NO_FILE');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return apiError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.', 400, 'INVALID_FILE_TYPE');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return apiError('File size exceeds 5MB limit', 400, 'FILE_TOO_LARGE');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `product_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${vendor.id}/${fileName}`;

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('[Product Upload] Storage error:', error);
      return apiError('Failed to upload image', 500, 'UPLOAD_FAILED');
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return apiSuccess({ url: publicUrl, path: filePath }, 'Image uploaded successfully');
  } catch (err) {
    console.error('[Product Upload] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
