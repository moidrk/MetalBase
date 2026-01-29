'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { RefreshCw, Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MetalSummaryCard } from '@/components/dashboard/MetalSummaryCard';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import { HoldingsBreakdown } from '@/components/dashboard/HoldingsBreakdown';
import { PriceHistoryChart } from '@/components/charts/PriceHistoryChart';
import { PortfolioValueChart } from '@/components/charts/PortfolioValueChart';
import { MetalBreakdownChart } from '@/components/charts/MetalBreakdownChart';
import { HoldingsContributionChart } from '@/components/charts/HoldingsContributionChart';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { formatCurrency, formatCurrencyWithSign, formatPercentage } from '@/lib/formatting';
import {
  generatePriceHistoryData,
  generatePortfolioValueData,
  generateMetalBreakdown,
  generateHoldingsContribution,
} from '@/lib/chartData';
import { Currency } from '@/types/portfolio';

export default function DashboardPage() {
  const currency: Currency = 'PKR';
  const { data, loading, error, refetch, refreshPrices, refreshingPrices } = usePortfolioData(currency);

  // Generate chart data
  const priceData = generatePriceHistoryData();
  const portfolioData = data ? generatePortfolioValueData(data.holdings) : [];
  const metalBreakdownData = data ? generateMetalBreakdown(data.holdings, data.prices) : [];
  const contributionData = data ? generateHoldingsContribution(data.holdings, data.prices) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <Button 
            onClick={() => refetch()}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const isProfitable = data.totals.totalProfitLoss >= 0;

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Overview</h1>
          <p className="text-muted-foreground mt-1">
            {data.totals.holdingsCount} holdings • Updated {data.priceAgeMinutes.toFixed(0)} min ago
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshPrices()}
            disabled={refreshingPrices}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshingPrices ? 'animate-spin' : ''}`} />
            {refreshingPrices ? 'Refreshing...' : 'Refresh Prices'}
          </Button>
          <Button asChild>
            <Link href="/holdings/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Holding
            </Link>
          </Button>
        </div>
      </div>

      {data.totals.holdingsCount === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No holdings yet</p>
          <Button asChild>
            <Link href="/holdings/new">
              Add First Holding
            </Link>
          </Button>
        </Card>
      ) : (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricsCard
              title="Total Value"
              value={formatCurrency(data.totals.totalValue, currency)}
              variant="primary"
            />
            <MetricsCard
              title="Total Invested"
              value={formatCurrency(data.totals.totalBuyValue, currency)}
              variant="neutral"
            />
            <MetricsCard
              title="Total Profit/Loss"
              value={formatCurrencyWithSign(data.totals.totalProfitLoss, currency)}
              variant={isProfitable ? 'success' : 'danger'}
              trend={{
                value: formatPercentage(data.totals.totalProfitLossPercent),
                positive: data.totals.totalProfitLoss >= 0,
              }}
            />
            <MetricsCard
              title="Total Holdings"
              value={data.totals.holdingsCount.toString()}
              variant="neutral"
              subtitle={`${data.goldSummary ? 'Gold' : ''} ${data.silverSummary ? '& Silver' : ''}`}
            />
          </div>

          {/* Metal Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetalSummaryCard
              metal="gold"
              summary={data.goldSummary}
              currency={currency}
              pricePerGram={data.prices.gold.PKR}
              priceSource={data.prices.source}
            />
            <MetalSummaryCard
              metal="silver"
              summary={data.silverSummary}
              currency={currency}
              pricePerGram={data.prices.silver.PKR}
              priceSource={data.prices.source}
            />
          </div>

          {/* Holdings Breakdown */}
          <HoldingsBreakdown
            holdings={data.holdingsWithCalculations}
            currency={currency}
          />

          {/* Charts Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Portfolio Analytics</h2>
            
            {/* Price History and Portfolio Value */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PriceHistoryChart data={priceData} />
              <PortfolioValueChart 
                data={portfolioData} 
                currency={currency}
              />
            </div>

            {/* Metal Breakdown and Holdings Contribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetalBreakdownChart data={metalBreakdownData} />
              <HoldingsContributionChart data={contributionData} />
            </div>
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href="/holdings/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Holding
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/holdings">
                  View All Holdings
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => refreshPrices()}
                disabled={refreshingPrices}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshingPrices ? 'animate-spin' : ''}`} />
                Refresh Prices
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
