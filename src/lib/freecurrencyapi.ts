export interface FXRates {
  PKR: number;
  USD: number;
  timestamp: string;
}

interface FreeCurrencyAPIResponse {
  data: {
    PKR: number;
    USD?: number;
  };
}

const FREECURRENCYAPI_BASE_URL = "https://api.freecurrencyapi.com/v1/latest";
const FALLBACK_RATE = 278; // 1 USD = 278 PKR (from Phase 3)

let rateCache: {
  rates?: FXRates;
  timestamp: number;
} | null = null;

const CACHE_TTL = 3600000; // 1 hour in milliseconds

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

export async function getExchangeRate(): Promise<FXRates> {
  // Check cache first
  if (rateCache && isCacheValid(rateCache.timestamp)) {
    console.log(
      `Using cached exchange rate: 1 USD = ${rateCache.rates!.PKR} PKR`
    );
    return rateCache.rates!;
  }

  const apiKey =
    process.env.FREECURRENCYAPI_KEY ||
    process.env.NEXT_PUBLIC_FREECURRENCYAPI_KEY;

  if (!apiKey) {
    console.warn(
      "FreeCurrencyAPI key not found. Using fallback rate: 1 USD =",
      FALLBACK_RATE,
      "PKR"
    );
    const fallbackRates: FXRates = {
      USD: 1,
      PKR: FALLBACK_RATE,
      timestamp: new Date().toISOString(),
    };
    return fallbackRates;
  }

  try {
    const response = await fetch(
      `${FREECURRENCYAPI_BASE_URL}?apikey=${apiKey}&currencies=PKR`
    );

    if (!response.ok) {
      console.error(
        `FreeCurrencyAPI error: ${response.status} ${response.statusText}`
      );
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: FreeCurrencyAPIResponse = await response.json();

    if (!data.data || !data.data.PKR) {
      throw new Error("Invalid API response: missing PKR rate");
    }

    const rates: FXRates = {
      USD: 1,
      PKR: data.data.PKR,
      timestamp: new Date().toISOString(),
    };

    // Update cache
    rateCache = {
      rates,
      timestamp: Date.now(),
    };

    console.log(`FreeCurrencyAPI: Fetched rate - 1 USD = ${rates.PKR} PKR`);

    return rates;
  } catch (error) {
    console.error("Error fetching exchange rates from FreeCurrencyAPI:", error);

    // If we have cached data (even if expired), return it as fallback
    if (rateCache?.rates) {
      console.log(
        "API failed, using expired cache:",
        rateCache.rates.PKR,
        "PKR"
      );
      return rateCache.rates;
    }

    // Last resort: use fallback rate
    console.log("Using fallback rate:", FALLBACK_RATE, "PKR");
    return {
      USD: 1,
      PKR: FALLBACK_RATE,
      timestamp: new Date().toISOString(),
    };
  }
}

export function clearCache(): void {
  rateCache = null;
  console.log("FreeCurrencyAPI cache cleared");
}
