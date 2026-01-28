import { Holding, Metal, Currency } from "@/types/portfolio";
import { convertToBaseUnit } from "./conversions";
import { getPrice } from "./prices";

export interface HoldingSummary {
  totalQuantityGrams: number;
  totalBuyValue: number;
  totalCurrentValue: number;
  averageBuyPricePerGram: number;
  profitLoss: number;
  profitLossPercent: number;
  holdings: Holding[];
}

export interface PortfolioTotals {
  totalValue: number;
  totalBuyValue: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  holdingsCount: number;
}

export interface HoldingWithCalculations extends Holding {
  quantityInGrams: number;
  currentPricePerGram: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  portfolioPercentage: number;
}

export function calculateMetalSummary(
  holdings: Holding[],
  metal: Metal,
  currency: Currency
): HoldingSummary | null {
  const metalHoldings = holdings.filter((h) => h.metal === metal);

  if (metalHoldings.length === 0) {
    return null;
  }

  const totalQuantityGrams = metalHoldings.reduce((sum, h) => {
    return sum + convertToBaseUnit(h.quantity, h.unit);
  }, 0);

  const totalBuyValue = metalHoldings.reduce((sum, h) => {
    return sum + (h.buy_price * h.quantity);
  }, 0);

  const currentPricePerGram = getPrice(metal, currency);
  const totalCurrentValue = totalQuantityGrams * currentPricePerGram;

  const averageBuyPricePerGram =
    totalQuantityGrams > 0 ? totalBuyValue / totalQuantityGrams : 0;

  const profitLoss = totalCurrentValue - totalBuyValue;
  const profitLossPercent =
    totalBuyValue > 0 ? (profitLoss / totalBuyValue) * 100 : 0;

  return {
    totalQuantityGrams,
    totalBuyValue,
    totalCurrentValue,
    averageBuyPricePerGram,
    profitLoss,
    profitLossPercent,
    holdings: metalHoldings,
  };
}

export function calculatePortfolioTotals(
  holdings: Holding[],
  currency: Currency
): PortfolioTotals {
  if (holdings.length === 0) {
    return {
      totalValue: 0,
      totalBuyValue: 0,
      totalProfitLoss: 0,
      totalProfitLossPercent: 0,
      holdingsCount: 0,
    };
  }

  const goldSummary = calculateMetalSummary(holdings, "gold", currency);
  const silverSummary = calculateMetalSummary(holdings, "silver", currency);

  const totalValue =
    (goldSummary?.totalCurrentValue || 0) + (silverSummary?.totalCurrentValue || 0);
  const totalBuyValue =
    (goldSummary?.totalBuyValue || 0) + (silverSummary?.totalBuyValue || 0);

  const totalProfitLoss = totalValue - totalBuyValue;
  const totalProfitLossPercent =
    totalBuyValue > 0 ? (totalProfitLoss / totalBuyValue) * 100 : 0;

  return {
    totalValue,
    totalBuyValue,
    totalProfitLoss,
    totalProfitLossPercent,
    holdingsCount: holdings.length,
  };
}

export function calculateHoldingWithCalculations(
  holding: Holding,
  currency: Currency,
  totalPortfolioValue: number
): HoldingWithCalculations {
  const quantityInGrams = convertToBaseUnit(holding.quantity, holding.unit);
  const currentPricePerGram = getPrice(holding.metal, currency);
  const currentValue = quantityInGrams * currentPricePerGram;
  const buyValue = holding.buy_price * holding.quantity;

  const profitLoss = currentValue - buyValue;
  const profitLossPercent = buyValue > 0 ? (profitLoss / buyValue) * 100 : 0;

  const portfolioPercentage =
    totalPortfolioValue > 0 ? (currentValue / totalPortfolioValue) * 100 : 0;

  return {
    ...holding,
    quantityInGrams,
    currentPricePerGram,
    currentValue,
    profitLoss,
    profitLossPercent,
    portfolioPercentage,
  };
}

export function calculateAllHoldings(
  holdings: Holding[],
  currency: Currency
): HoldingWithCalculations[] {
  const totals = calculatePortfolioTotals(holdings, currency);

  return holdings.map((holding) =>
    calculateHoldingWithCalculations(holding, currency, totals.totalValue)
  );
}
