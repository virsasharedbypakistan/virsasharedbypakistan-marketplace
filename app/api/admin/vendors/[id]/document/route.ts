import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiError, requireRole } from '@/lib/api-helpers';

function extractStoragePath(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const marker = '/vendor-documents/';
    const index = parsed.pathname.indexOf(marker);
    if (index === -1) return null;
    return decodeURIComponent(parsed.pathname.slice(index + marker.length));
  } catch {
    const marker = '/vendor-documents/';
    const index = url.indexOf(marker);
    if (index === -1) return url;
    return url.slice(index + marker.length);
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole('admin');
    if ('error' in authResult) return authResult.error;

    const { id } = await params;

    const { data: vendor } = await supabaseAdmin
      .from('vendors')
      .select('cnic_document_url')
      .eq('id', id)
      .single();

    if (!vendor?.cnic_document_url) {
      return apiError('CNIC document not found', 404, 'DOCUMENT_NOT_FOUND');
    }

    const path = extractStoragePath(vendor.cnic_document_url);
    if (!path) {
      return apiError('Invalid document path', 400, 'INVALID_DOCUMENT_PATH');
    }

    const { data, error } = await supabaseAdmin.storage
      .from('vendor-documents')
      .createSignedUrl(path, 60 * 10);

    if (error || !data?.signedUrl) {
      return apiError('Failed to create download link', 500, 'SIGNED_URL_FAILED');
    }

    return NextResponse.redirect(data.signedUrl, 302);
  } catch (err) {
    console.error('[Admin Vendor Document] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
