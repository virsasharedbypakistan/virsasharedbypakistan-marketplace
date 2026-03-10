import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { apiSuccess, apiError, requireRole, getVendorForUser } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole("vendor");
    if ('error' in authResult) return authResult.error;

    const { user } = authResult;

    const vendor = await getVendorForUser(user.id);
    if (!vendor) {
      return apiError("Vendor profile not found", 404, "VENDOR_NOT_FOUND");
    }

    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("id, name, price, stock, status, images, category_id, categories(name)")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Vendor Products GET] Error:", error);
      return apiError("Failed to fetch products", 500);
    }

    // Format products to include category_name for frontend consistency
    const formattedProducts = products?.map(p => ({
        ...p,
        category_name: (p.categories as unknown as { name: string } | null)?.name || null
    })) || [];

    return apiSuccess({ data: formattedProducts });
  } catch (error) {
    console.error("[Vendor Products GET] Exception:", error);
    return apiError("Internal server error", 500);
  }
}
