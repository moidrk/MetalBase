'use client';

import { usePortfolioData } from '@/hooks/usePortfolioData';
import { PriceHistoryChart } from '@/components/charts/PriceHistoryChart';
import { PortfolioValueChart } from '@/components/charts/PortfolioValueChart';
import { MetalBreakdownChart } from '@/components/charts/MetalBreakdownChart';
import { HoldingsContributionChart } from '@/components/charts/HoldingsContributionChart';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatCurrencyWithSign, formatPercentage } from '@/lib/formatting';
import {
  generatePriceHistoryData,
  generatePortfolioValueData,
  generateMetalBreakdown,
  generateHoldingsContribution,
} from '@/lib/chartData';
import { Currency } from '@/types/portfolio';

export default function ChartsPage() {
  const currency: Currency = 'PKR';
  const { data, loading, error, refreshPrices, refreshingPrices } = usePortfolioData(currency);

  // Generate chart data
  const priceData = generatePriceHistoryData();
  const portfolioData = data ? generatePortfolioValueData(data.holdings) : [];
  const metalBreakdownData = data ? generateMetalBreakdown(data.holdings, data.prices) : [];
  const contributionData = data ? generateHoldingsContribution(data.holdings, data.prices) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading charts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Detailed charts and visualizations of your portfolio
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refreshPrices()}
          disabled={refreshingPrices}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshingPrices ? 'animate-spin' : ''}`} />
          {refreshingPrices ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Summary Stats */}
      {data && data.totals.holdingsCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(data.totals.totalValue, currency)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Invested</p>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(data.totals.totalBuyValue, currency)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Profit/Loss</p>
            <p className={`text-2xl font-bold mt-1 ${
              data.totals.totalProfitLoss >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrencyWithSign(data.totals.totalProfitLoss, currency)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">P/L Percentage</p>
            <p className={`text-2xl font-bold mt-1 ${
              data.totals.totalProfitLoss >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatPercentage(data.totals.totalProfitLossPercent)}
            </p>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="space-y-6">
        {/* Price History Chart - Full Width */}
        <PriceHistoryChart data={priceData} title="Historical Price Trends" />

        {/* Portfolio Value Chart - Full Width */}
        <PortfolioValueChart 
          data={portfolioData} 
          currency={currency}
          title="Portfolio Value Over Time"
        />

        {/* Metal Breakdown and Holdings Contribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MetalBreakdownChart 
            data={metalBreakdownData} 
            title="Portfolio Composition by Metal"
          />
          <HoldingsContributionChart 
            data={contributionData}
            title="Holdings Contribution Analysis"
          />
        </div>
      </div>

      {/* No Data Message */}
      {(!data || data.totals.holdingsCount === 0) && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Add holdings to see portfolio analytics and visualizations
          </p>
          <Button asChild>
            <Link href="/holdings/new">
              Add First Holding
            </Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
