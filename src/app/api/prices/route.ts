import { NextRequest, NextResponse } from "next/server";
import { getPrices } from "@/lib/prices";

// Force dynamic rendering for this route since it uses request.headers for rate limiting
export const dynamic = 'force-dynamic';

const requestTracker = new Map<string, number>();
const RATE_LIMIT_WINDOW = 10000; // 10 seconds

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  return ip;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const lastRequest = requestTracker.get(key);

  if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW) {
    return true;
  }

  requestTracker.set(key, now);

  // Clean up old entries
  if (requestTracker.size > 1000) {
    const cutoff = now - RATE_LIMIT_WINDOW;
    const keysToDelete: string[] = [];
    requestTracker.forEach((timestamp, k) => {
      if (timestamp < cutoff) {
        keysToDelete.push(k);
      }
    });
    keysToDelete.forEach((k) => requestTracker.delete(k));
  }

  return false;
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    if (isRateLimited(rateLimitKey)) {
      console.log(`Rate limit exceeded for ${rateLimitKey}`);
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait 10 seconds before requesting again.",
        },
        { status: 429 }
      );
    }

    console.log(`Fetching prices for request from ${rateLimitKey}`);

    // Fetch prices
    const prices = await getPrices();

    // Calculate how fresh the prices are
    const updatedAt = new Date(prices.updatedAt);
    const ageMinutes = Math.floor(
      (Date.now() - updatedAt.getTime()) / 1000 / 60
    );
    const isFresh = ageMinutes < 5;

    return NextResponse.json({
      ...prices,
      isFresh,
      ageMinutes,
    });
  } catch (error) {
    console.error("Error in /api/prices:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch prices",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
