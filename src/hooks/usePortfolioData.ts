"use client";

import { useState, useEffect, useCallback } from "react";
import { Holding, Currency } from "@/types/portfolio";
import {
  calculatePortfolioTotals,
  calculateMetalSummary,
  calculateAllHoldings,
} from "@/lib/calculations";
import { CurrentPrices, MOCK_PRICES } from "@/lib/prices";

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
  prices: CurrentPrices;
  isPriceFresh: boolean;
  priceAgeMinutes: number;
}

export interface UsePortfolioDataResult {
  data: PortfolioData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  refreshPrices: () => Promise<void>;
  refreshingPrices: boolean;
}

export function usePortfolioData(
  currency: Currency = "PKR",
  autoRefresh: boolean = false
): UsePortfolioDataResult {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshingPrices, setRefreshingPrices] = useState(false);

  const fetchPrices = useCallback(async (): Promise<{
    prices: CurrentPrices;
    isFresh: boolean;
    ageMinutes: number;
  }> => {
    try {
      const priceResponse = await fetch("/api/prices");
      if (!priceResponse.ok) {
        throw new Error("Failed to fetch prices");
      }
      const priceData = await priceResponse.json();
      return {
        prices: priceData,
        isFresh: priceData.isFresh || false,
        ageMinutes: priceData.ageMinutes || 0,
      };
    } catch (err) {
      console.error("Error fetching prices:", err);
      return {
        prices: MOCK_PRICES,
        isFresh: false,
        ageMinutes: 999,
      };
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [holdingsResponse, priceData] = await Promise.all([
        fetch("/api/holdings"),
        fetchPrices(),
      ]);

      if (!holdingsResponse.ok) {
        throw new Error("Failed to fetch holdings");
      }

      const holdings: Holding[] = await holdingsResponse.json();

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
        prices: priceData.prices,
        isPriceFresh: priceData.isFresh,
        priceAgeMinutes: priceData.ageMinutes,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching portfolio data:", err);
    } finally {
      setLoading(false);
    }
  }, [currency, fetchPrices]);

  const refreshPrices = useCallback(async () => {
    if (!data) return;

    try {
      setRefreshingPrices(true);
      const priceData = await fetchPrices();

      // Recalculate with new prices
      const totals = calculatePortfolioTotals(data.holdings, currency);
      const goldSummary = calculateMetalSummary(
        data.holdings,
        "gold",
        currency
      );
      const silverSummary = calculateMetalSummary(
        data.holdings,
        "silver",
        currency
      );
      const holdingsWithCalculations = calculateAllHoldings(
        data.holdings,
        currency
      );

      setData({
        ...data,
        totals,
        goldSummary,
        silverSummary,
        holdingsWithCalculations,
        prices: priceData.prices,
        isPriceFresh: priceData.isFresh,
        priceAgeMinutes: priceData.ageMinutes,
      });
    } catch (err) {
      console.error("Error refreshing prices:", err);
    } finally {
      setRefreshingPrices(false);
    }
  }, [data, currency, fetchPrices]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(
      () => {
        fetchData();
      },
      5 * 60 * 1000
    ); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    refreshPrices,
    refreshingPrices,
  };
}
