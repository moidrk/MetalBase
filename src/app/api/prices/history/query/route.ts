import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");
    const currency = (searchParams.get("currency") || "PKR").toUpperCase();

    // Validate currency
    if (!["USD", "PKR"].includes(currency)) {
      return NextResponse.json(
        { error: "Invalid currency. Must be USD or PKR" },
        { status: 400 }
      );
    }

    // Validate days
    const validDays = [30, 180, 365];
    if (!validDays.includes(days)) {
      return NextResponse.json(
        { error: "Invalid days. Must be 30, 180, or 365" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch historical prices
    const { data, error } = await supabase
      .from("price_history")
      .select("date, gold_usd, gold_pkr, silver_usd, silver_pkr")
      .gte("date", startDate.toISOString().split('T')[0])
      .order("date", { ascending: true });

    if (error) {
      throw error;
    }

    // Format data for chart
    const formattedData = data.map((item) => ({
      date: item.date,
      gold: currency === "USD" ? Number(item.gold_usd) : Number(item.gold_pkr),
      silver: currency === "USD" ? Number(item.silver_usd) : Number(item.silver_pkr),
    }));

    console.log(`Retrieved ${formattedData.length} price history records for ${days} days`);

    return NextResponse.json(formattedData);
  } catch (error: any) {
    console.error("Error fetching price history:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch price history" },
      { status: 500 }
    );
  }
}
