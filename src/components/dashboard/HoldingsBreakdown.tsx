import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Currency } from "@/types/portfolio";
import { formatCurrency, formatCurrencyWithSign, formatWeightWithConversion } from "@/lib/formatting";
import { HoldingWithCalculations } from "@/lib/calculations";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface HoldingsBreakdownProps {
  holdings: HoldingWithCalculations[];
  currency: Currency;
  className?: string;
}

export function HoldingsBreakdown({
  holdings,
  currency,
  className,
}: HoldingsBreakdownProps) {
  if (holdings.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Holdings Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary row showing portfolio contribution */}
          <div className="grid grid-cols-12 gap-4 text-sm text-muted-foreground font-medium border-b pb-2">
            <div className="col-span-4 md:col-span-3">Metal & Purity</div>
            <div className="col-span-3 md:col-span-2">Quantity</div>
            <div className="col-span-2 hidden md:block">Buy Price</div>
            <div className="col-span-2 md:col-span-2">Current Value</div>
            <div className="col-span-2 md:col-span-2 text-right">P/L</div>
            <div className="col-span-1 md:col-span-1 text-right">% Portfolio</div>
          </div>

          {/* Holdings list */}
          {holdings.map((holding) => {
            const isProfitable = holding.profitLoss >= 0;

            return (
              <div
                key={holding.id}
                className="grid grid-cols-12 gap-4 text-sm items-center py-2 hover:bg-muted/50 rounded-md px-2 transition-colors"
              >
                {/* Metal & Purity */}
                <div className="col-span-4 md:col-span-3">
                  <div className="font-medium">
                    {holding.metal.charAt(0).toUpperCase() + holding.metal.slice(1)} {holding.purity}
                  </div>
                  <div className="text-xs text-muted-foreground md:hidden">
                    {formatCurrency(holding.buy_price, currency)}/{holding.unit}
                  </div>
                </div>

                {/* Quantity */}
                <div className="col-span-3 md:col-span-2 text-muted-foreground">
                  <div>{formatWeightWithConversion(holding.quantityInGrams, holding.unit)}</div>
                </div>

                {/* Buy Price (hidden on mobile) */}
                <div className="col-span-2 hidden md:block text-muted-foreground">
                  {formatCurrency(holding.buy_price, currency)}/{holding.unit}
                </div>

                {/* Current Value */}
                <div className="col-span-2 md:col-span-2 font-medium">
                  {formatCurrency(holding.currentValue, currency)}
                </div>

                {/* Profit/Loss */}
                <div
                  className={cn(
                    "col-span-2 md:col-span-2 text-right font-medium flex items-center justify-end gap-1",
                    isProfitable
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {isProfitable ? (
                    <TrendingUp className="h-3 w-3 hidden md:inline" />
                  ) : holding.profitLoss < 0 ? (
                    <TrendingDown className="h-3 w-3 hidden md:inline" />
                  ) : (
                    <Minus className="h-3 w-3 hidden md:inline" />
                  )}
                  <span className="md:hidden">
                    {isProfitable ? "+" : ""}
                    {formatCurrency(holding.profitLoss, currency)}
                  </span>
                  <span className="hidden md:inline">
                    {formatCurrencyWithSign(holding.profitLoss, currency)}
                  </span>
                </div>

                {/* Portfolio Percentage */}
                <div className="col-span-1 md:col-span-1 text-right text-muted-foreground">
                  {holding.portfolioPercentage.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Total row */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total Portfolio Value</span>
            <span className="font-bold text-lg">
              {formatCurrency(
                holdings.reduce((sum, h) => sum + h.currentValue, 0),
                currency
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
