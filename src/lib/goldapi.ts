interface GoldAPIResponse {
  timestamp: number;
  metal: string;
  currency: string;
  price: number;
  prev_close_price: number;
  ch: number;
  chp: number;
  ask: number;
  bid: number;
}

const GOLDAPI_BASE_URL = "https://www.goldapi.io/api";
const TROY_OUNCE_TO_GRAM = 31.1035;

let priceCache: {
  gold?: { price: number; timestamp: number };
  silver?: { price: number; timestamp: number };
} = {};

const CACHE_TTL = 3600000; // 1 hour in milliseconds

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

async function fetchFromGoldAPI(
  metal: "XAU" | "XAG",
  currency: "USD"
): Promise<number> {
  const apiKey = process.env.GOLDAPI_KEY || process.env.NEXT_PUBLIC_GOLDAPI_KEY;

  if (!apiKey) {
    console.warn(
      "GoldAPI key not found in environment variables. Using fallback prices."
    );
    throw new Error("API key not configured");
  }

  try {
    const response = await fetch(`${GOLDAPI_BASE_URL}/${metal}/${currency}`, {
      headers: {
        "x-access-token": apiKey,
      },
    });

    if (!response.ok) {
      console.error(`GoldAPI error: ${response.status} ${response.statusText}`);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: GoldAPIResponse = await response.json();

    if (!data.price) {
      throw new Error("Invalid API response: missing price");
    }

    // Convert from per troy ounce to per gram
    const pricePerGram = data.price / TROY_OUNCE_TO_GRAM;

    console.log(
      `GoldAPI: Fetched ${metal} price: $${pricePerGram.toFixed(2)}/g (from $${data.price.toFixed(2)}/oz)`
    );

    return pricePerGram;
  } catch (error) {
    console.error(`Error fetching ${metal} price from GoldAPI:`, error);
    throw error;
  }
}

export async function getGoldPrice(currency: "USD" = "USD"): Promise<number> {
  // Only USD is supported by GoldAPI directly
  if (currency !== "USD") {
    throw new Error("Only USD currency is supported by GoldAPI");
  }

  // Check cache first
  if (priceCache.gold && isCacheValid(priceCache.gold.timestamp)) {
    console.log(
      `Using cached gold price: $${priceCache.gold.price.toFixed(2)}/g`
    );
    return priceCache.gold.price;
  }

  try {
    const price = await fetchFromGoldAPI("XAU", "USD");
    priceCache.gold = { price, timestamp: Date.now() };
    return price;
  } catch (error) {
    // If we have cached data (even if expired), return it as fallback
    if (priceCache.gold) {
      console.log(
        "API failed, using expired cache for gold:",
        priceCache.gold.price
      );
      return priceCache.gold.price;
    }
    throw error;
  }
}

export async function getSilverPrice(currency: "USD" = "USD"): Promise<number> {
  // Only USD is supported by GoldAPI directly
  if (currency !== "USD") {
    throw new Error("Only USD currency is supported by GoldAPI");
  }

  // Check cache first
  if (priceCache.silver && isCacheValid(priceCache.silver.timestamp)) {
    console.log(
      `Using cached silver price: $${priceCache.silver.price.toFixed(2)}/g`
    );
    return priceCache.silver.price;
  }

  try {
    const price = await fetchFromGoldAPI("XAG", "USD");
    priceCache.silver = { price, timestamp: Date.now() };
    return price;
  } catch (error) {
    // If we have cached data (even if expired), return it as fallback
    if (priceCache.silver) {
      console.log(
        "API failed, using expired cache for silver:",
        priceCache.silver.price
      );
      return priceCache.silver.price;
    }
    throw error;
  }
}

export function clearCache(): void {
  priceCache = {};
  console.log("GoldAPI cache cleared");
}
