"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown } from "lucide-react";
import { Metal, Currency, Unit } from "@/types/portfolio";
import { formatCurrency, formatCurrencyWithSign, formatWeightWithConversion, formatPercentage, formatPricePerGram } from "@/lib/formatting";
import { calculateMetalSummary } from "@/lib/calculations";

interface MetalSummaryCardProps {
  metal: Metal;
  summary: ReturnType<typeof calculateMetalSummary> | null;
  currency: Currency;
  className?: string;
  pricePerGram?: number;
  priceSource?: "live" | "cached" | "mock";
}

const metalIcons = {
  gold: "🥇",
  silver: "🥈",
};

const metalNames = {
  gold: "Gold",
  silver: "Silver",
};

export function MetalSummaryCard({
  metal,
  summary,
  currency,
  className,
  pricePerGram,
  priceSource = "mock",
}: MetalSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!summary) {
    return null;
  }

  const isProfitable = summary.profitLoss >= 0;
  
  const priceSourceBadge = priceSource === "live" 
    ? "🟢 Live" 
    : priceSource === "cached" 
    ? "🟡 Cached" 
    : "⚪ Estimated";

  // Find most common unit for display
  const unitCounts = summary.holdings.reduce((acc, h) => {
    acc[h.unit] = (acc[h.unit] || 0) + 1;
    return acc;
  }, {} as Record<Unit, number>);

  const mostCommonUnit = Object.entries(unitCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as Unit || "gram";

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <span className="text-2xl">{metalIcons[metal]}</span>
            {metalNames[metal]}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isExpanded ? (
          <div className="space-y-4">
            {/* Total Quantity */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Quantity</span>
              <span className="font-medium">
                {formatWeightWithConversion(summary.totalQuantityGrams, mostCommonUnit)}
              </span>
            </div>

            {/* Average Buy Price */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Buy Price</span>
              <span className="font-medium">
                {formatCurrency(summary.averageBuyPricePerGram, currency)}/g
              </span>
            </div>

            {/* Total Buy Value */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Buy Value</span>
              <span className="font-medium">{formatCurrency(summary.totalBuyValue, currency)}</span>
            </div>

            {/* Current Market Price */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Market Price</span>
              <div className="text-right">
                <div className="font-medium text-primary">
                  {pricePerGram 
                    ? formatPricePerGram(pricePerGram, currency)
                    : formatCurrency(summary.totalCurrentValue / summary.totalQuantityGrams, currency) + "/g"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {priceSourceBadge}
                </div>
              </div>
            </div>

            {/* Current Value */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Value</span>
              <span className="font-medium">{formatCurrency(summary.totalCurrentValue, currency)}</span>
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Profit/Loss */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                {isProfitable ? (
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
                Profit/Loss
              </span>
              <span
                className={`font-semibold ${isProfitable ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {formatCurrencyWithSign(summary.profitLoss, currency)}
              </span>
            </div>

            {/* P/L Percentage */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">P/L %</span>
              <span
                className={`font-semibold ${isProfitable ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {formatPercentage(summary.profitLossPercent)}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Click to expand details
          </div>
        )}
      </CardContent>
    </Card>
  );
}
