import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getHoldings, createHolding } from "@/lib/supabase/holdings";
import { getPrices } from "@/lib/prices";
import { convertToGrams } from "@/lib/conversions";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const holdings = await getHoldings(supabase, user.id);

    // Fetch current prices
    const prices = await getPrices();

    // Calculate current value and profit/loss for each holding
    const holdingsWithCalculations = holdings.map((holding) => {
      const quantityInGrams = convertToGrams(holding.quantity, holding.unit);
      const currentPricePerGram =
        holding.metal === "gold" ? prices.gold.USD : prices.silver.USD;

      // Calculate current value in USD
      const currentValueUSD = quantityInGrams * currentPricePerGram;

      // Convert to user's currency if needed
      let currentValue: number;
      let exchangeRate: number;

      if (holding.currency === "USD") {
        currentValue = currentValueUSD;
        exchangeRate = 1;
      } else {
        exchangeRate = holding.currency === "PKR" ? prices.rates.PKR : 1;
        currentValue = currentValueUSD * exchangeRate;
      }

      // Calculate profit/loss
      const buyValue = holding.buy_price * holding.quantity;
      const profitLoss = currentValue - buyValue;
      const profitLossPercent = buyValue > 0 ? (profitLoss / buyValue) * 100 : 0;

      return {
        ...holding,
        currentValue: Math.round(currentValue * 100) / 100,
        profitLoss: Math.round(profitLoss * 100) / 100,
        profitLossPercent: Math.round(profitLossPercent * 100) / 100,
      };
    });

    return NextResponse.json(holdingsWithCalculations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const holding = await createHolding(supabase, {
      ...body,
      user_id: user.id,
    });
    return NextResponse.json(holding);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
