"use client";

import { usePortfolioData } from "@/hooks/usePortfolioData";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { MetalSummaryCard } from "@/components/dashboard/MetalSummaryCard";
import { HoldingsBreakdown } from "@/components/dashboard/HoldingsBreakdown";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Loader2, Plus, RefreshCw, AlertCircle } from "lucide-react";
import { formatCurrency, formatPercentage, formatCurrencyWithSign } from "@/lib/formatting";
import Link from "next/link";

export default function DashboardPage() {
  const { data, loading, error, refetch } = usePortfolioData("PKR", false);

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

  const { totals, goldSummary, silverSummary, holdingsWithCalculations } = data;

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
        <Button variant="outline" onClick={refetch} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
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
        />
        <MetalSummaryCard
          metal="silver"
          summary={silverSummary}
          currency="PKR"
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
