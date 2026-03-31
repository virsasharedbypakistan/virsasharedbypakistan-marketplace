import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { apiSuccess, apiError, requireRole } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
    try {
        // Require admin role
        const authResult = await requireRole("admin");
        if ("error" in authResult) return authResult.error;

        // Get date range (last 7 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6); // Last 7 days including today

        // Generate array of dates for the last 7 days
        const dates: string[] = [];
        const labels: string[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        }

        // Fetch daily revenue and commission for the last 7 days
        const { data: orderItems, error: orderError } = await supabaseAdmin
            .from("order_items")
            .select(`
                created_at,
                unit_price,
                quantity,
                subtotal,
                commission_rate
            `)
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString());

        if (orderError) {
            console.error("Error fetching order items:", orderError);
            return apiError("Failed to fetch analytics", 500);
        }

        // Calculate daily revenue and commission
        const dailyData = dates.map((date, index) => {
            const dayStart = new Date(date);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);

            const dayOrders = (orderItems || []).filter(item => {
                const itemDate = new Date(item.created_at);
                return itemDate >= dayStart && itemDate <= dayEnd;
            });

            const revenue = dayOrders.reduce((sum, item) => {
                const lineTotal = item.subtotal ?? (parseFloat(item.unit_price) * item.quantity);
                return sum + lineTotal;
            }, 0);

            const commission = dayOrders.reduce((sum, item) => {
                const itemTotal = item.subtotal ?? (parseFloat(item.unit_price) * item.quantity);
                const commissionRate = parseFloat(item.commission_rate) || 0;
                return sum + (itemTotal * commissionRate / 100);
            }, 0);

            return {
                date,
                label: labels[index],
                revenue: Math.round(revenue),
                commission: Math.round(commission)
            };
        });

        return apiSuccess({
            daily: dailyData,
            summary: {
                totalRevenue: dailyData.reduce((sum, day) => sum + day.revenue, 0),
                totalCommission: dailyData.reduce((sum, day) => sum + day.commission, 0),
                averageDaily: Math.round(dailyData.reduce((sum, day) => sum + day.revenue, 0) / 7)
            }
        });

    } catch (error) {
        console.error("Admin analytics error:", error);
        return apiError("Internal server error", 500);
    }
}
