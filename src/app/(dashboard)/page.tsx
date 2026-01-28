"use client";

import { usePortfolioData } from "@/hooks/usePortfolioData";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { MetalSummaryCard } from "@/components/dashboard/MetalSummaryCard";
import { HoldingsBreakdown } from "@/components/dashboard/HoldingsBreakdown";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Loader2, Plus, RefreshCw, AlertCircle, DollarSign } from "lucide-react";
import { formatCurrency, formatPercentage, formatCurrencyWithSign } from "@/lib/formatting";
import Link from "next/link";

export default function DashboardPage() {
  const { data, loading, error, refetch, refreshPrices, refreshingPrices } = usePortfolioData("PKR", false);

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive" className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-semibold">Error loading portfolio</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  if (!data || data.holdings.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center py-16 px-4">
          <div className="text-6xl mb-6">📊</div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Portfolio Overview</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            You haven&apos;t added any holdings yet. Start tracking your gold and silver investments today.
          </p>
          <Link href="/holdings/new">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Add Your First Holding
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { totals, goldSummary, silverSummary, holdingsWithCalculations, prices, isPriceFresh, priceAgeMinutes } = data;

  const priceSourceLabel = {
    live: "Live from GoldAPI",
    cached: "Cached (API)",
    mock: "Estimated Prices"
  }[prices.source];

  const priceSourceColor = {
    live: "text-green-600 dark:text-green-400",
    cached: "text-yellow-600 dark:text-yellow-400",
    mock: "text-muted-foreground"
  }[prices.source];

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio Overview</h1>
          <p className="text-muted-foreground mt-2">
            Track your precious metals investments and performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={refreshPrices} 
            className="gap-2"
            disabled={refreshingPrices}
          >
            {refreshingPrices ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <DollarSign className="h-4 w-4" />
            )}
            Refresh Prices
          </Button>
          <Button variant="outline" onClick={refetch} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Price Info Banner */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-3">
          <DollarSign className={`h-5 w-5 ${priceSourceColor}`} />
          <div>
            <span className={`font-medium ${priceSourceColor}`}>{priceSourceLabel}</span>
            <span className="text-sm text-muted-foreground ml-2">
              • Updated {priceAgeMinutes === 0 ? "just now" : `${priceAgeMinutes} min ago`}
            </span>
          </div>
        </div>
        {!isPriceFresh && prices.source !== "mock" && (
          <span className="text-xs text-muted-foreground">
            Prices may be stale
          </span>
        )}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Portfolio Value */}
        <MetricsCard
          title="Total Portfolio Value"
          value={formatCurrency(totals.totalValue, "PKR")}
          subtitle={`${totals.holdingsCount} holdings`}
          variant="primary"
        />

        {/* Total Profit/Loss (Absolute) */}
        <MetricsCard
          title="Total Profit/Loss"
          value={formatCurrencyWithSign(totals.totalProfitLoss, "PKR")}
          subtitle={formatCurrency(totals.totalBuyValue, "PKR") + " invested"}
          variant={totals.totalProfitLoss >= 0 ? "success" : "danger"}
          trend={{
            value: formatPercentage(totals.totalProfitLossPercent),
            positive: totals.totalProfitLoss >= 0,
          }}
        />

        {/* Total Profit/Loss (Percentage) */}
        <MetricsCard
          title="P/L Percentage"
          value={formatPercentage(totals.totalProfitLossPercent)}
          subtitle={totals.totalProfitLoss >= 0 ? "Gain" : "Loss"}
          variant={totals.totalProfitLoss >= 0 ? "success" : "danger"}
        />
      </div>

      {/* Per-Metal Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <MetalSummaryCard
          metal="gold"
          summary={goldSummary}
          currency="PKR"
          pricePerGram={prices.gold.PKR}
          priceSource={prices.source}
        />
        <MetalSummaryCard
          metal="silver"
          summary={silverSummary}
          currency="PKR"
          pricePerGram={prices.silver.PKR}
          priceSource={prices.source}
        />
      </div>

      {/* Holdings Breakdown */}
      <HoldingsBreakdown
        holdings={holdingsWithCalculations}
        currency="PKR"
      />
    </div>
  );
}
