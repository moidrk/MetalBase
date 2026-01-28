"use client";

import { useState, useEffect, useCallback } from "react";
import { Holding, Currency } from "@/types/portfolio";
import {
  calculatePortfolioTotals,
  calculateMetalSummary,
  calculateAllHoldings,
} from "@/lib/calculations";
import { MOCK_PRICES } from "@/lib/prices";

export interface PortfolioData {
  holdings: Holding[];
  totals: {
    totalValue: number;
    totalBuyValue: number;
    totalProfitLoss: number;
    totalProfitLossPercent: number;
    holdingsCount: number;
  };
  goldSummary: ReturnType<typeof calculateMetalSummary>;
  silverSummary: ReturnType<typeof calculateMetalSummary>;
  holdingsWithCalculations: ReturnType<typeof calculateAllHoldings>;
  prices: typeof MOCK_PRICES;
}

export interface UsePortfolioDataResult {
  data: PortfolioData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePortfolioData(
  currency: Currency = "PKR",
  autoRefresh: boolean = false
): UsePortfolioDataResult {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/holdings");

      if (!response.ok) {
        throw new Error("Failed to fetch holdings");
      }

      const holdings: Holding[] = await response.json();

      const totals = calculatePortfolioTotals(holdings, currency);
      const goldSummary = calculateMetalSummary(holdings, "gold", currency);
      const silverSummary = calculateMetalSummary(holdings, "silver", currency);
      const holdingsWithCalculations = calculateAllHoldings(holdings, currency);

      setData({
        holdings,
        totals,
        goldSummary,
        silverSummary,
        holdingsWithCalculations,
        prices: MOCK_PRICES,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching portfolio data:", err);
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
