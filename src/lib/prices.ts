import { Currency, Metal } from "@/types/portfolio";
import { getGoldPrice, getSilverPrice } from "./goldapi";
import { getExchangeRate, FXRates } from "./freecurrencyapi";

export interface CurrentPrices {
  gold: { USD: number; PKR: number }; // per gram
  silver: { USD: number; PKR: number }; // per gram
  rates: FXRates;
  updatedAt: string;
  source: "live" | "cached" | "mock";
}

// Mock prices for development/fallback (Phase 3)
// Gold: $65 USD per gram ($2,023 USD per troy oz)
// Silver: $0.85 USD per gram ($26.46 USD per troy oz)
// 1 USD = 278 PKR (placeholder conversion)
export const MOCK_PRICES: CurrentPrices = {
  gold: {
    USD: 65,
    PKR: 65 * 278,
  },
  silver: {
    USD: 0.85,
    PKR: 0.85 * 278,
  },
  rates: {
    USD: 1,
    PKR: 278,
    timestamp: new Date().toISOString(),
  },
  updatedAt: new Date().toISOString(),
  source: "mock",
};

let priceCache: CurrentPrices | null = null;
let cacheTimestamp: number = 0;

const CACHE_TTL = 3600000; // 1 hour in milliseconds

function isCacheValid(): boolean {
  return priceCache !== null && Date.now() - cacheTimestamp < CACHE_TTL;
}

export function getCachedPrices(): CurrentPrices | null {
  if (isCacheValid()) {
    return priceCache;
  }
  return null;
}

export function getMockPrices(): CurrentPrices {
  return {
    ...MOCK_PRICES,
    updatedAt: new Date().toISOString(),
  };
}

export async function getPrices(): Promise<CurrentPrices> {
  // Check cache first
  if (isCacheValid()) {
    console.log("Using cached prices");
    return { ...priceCache!, source: "cached" };
  }

  try {
    console.log("Fetching fresh prices from APIs...");

    // Fetch all prices in parallel
    const [goldUSD, silverUSD, rates] = await Promise.all([
      getGoldPrice("USD"),
      getSilverPrice("USD"),
      getExchangeRate(),
    ]);

    // Convert USD prices to PKR using exchange rate
    const goldPKR = goldUSD * rates.PKR;
    const silverPKR = silverUSD * rates.PKR;

    const prices: CurrentPrices = {
      gold: {
        USD: goldUSD,
        PKR: goldPKR,
      },
      silver: {
        USD: silverUSD,
        PKR: silverPKR,
      },
      rates,
      updatedAt: new Date().toISOString(),
      source: "live",
    };

    // Update cache
    priceCache = prices;
    cacheTimestamp = Date.now();

    console.log("Successfully fetched live prices:");
    console.log(`  Gold: $${goldUSD.toFixed(2)}/g | ₨${goldPKR.toFixed(2)}/g`);
    console.log(
      `  Silver: $${silverUSD.toFixed(2)}/g | ₨${silverPKR.toFixed(2)}/g`
    );
    console.log(`  Exchange Rate: 1 USD = ${rates.PKR} PKR`);

    return prices;
  } catch (error) {
    console.error("Error fetching prices from APIs:", error);

    // Try to return cached prices even if expired
    if (priceCache) {
      console.log("API failed, using expired cached prices");
      return { ...priceCache, source: "cached" };
    }

    // No fallback to mock data - throw error instead
    console.error("No cached prices available and API failed");
    throw new Error("Failed to fetch prices. Please ensure GoldAPI and FreeCurrencyAPI keys are configured.");
  }
}

// Helper function to get price for a specific metal and currency (for backwards compatibility)
export function getPrice(metal: Metal, currency: Currency): number {
  const prices = getCachedPrices() || MOCK_PRICES;
  return prices[metal][currency];
}

export function clearCache(): void {
  priceCache = null;
  cacheTimestamp = 0;
  console.log("Price cache cleared");
}
