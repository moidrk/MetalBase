import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPrices } from "@/lib/prices";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch current prices
    const prices = await getPrices();

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Check if price history for today already exists
    const { data: existing, error: checkError } = await supabase
      .from("price_history")
      .select("*")
      .eq("date", today)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    // Insert or update today's price history
    const priceData = {
      date: today,
      gold_usd: prices.gold.USD,
      gold_pkr: prices.gold.PKR,
      silver_usd: prices.silver.USD,
      silver_pkr: prices.silver.PKR,
      exchange_rate: prices.rates.PKR,
    };

    let result;
    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from("price_history")
        .update(priceData)
        .eq("date", today)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from("price_history")
        .insert(priceData)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    console.log(`Cron: Price history for ${today} stored successfully`);

    return NextResponse.json({
      success: true,
      message: "Price history updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error in cron job - update prices:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update price history" },
      { status: 500 }
    );
  }
}

// Allow GET for testing via browser
export async function GET(request: NextRequest) {
  return POST(request);
}
