import { Holding, Metal, Currency } from "@/types/portfolio";
import { CurrentPrices } from "./prices";

export interface PriceData {
  date: string;
  gold: number;
  silver: number;
}

export interface PortfolioData {
  date: string;
  value: number;
}

export interface MetalBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface ContributionData {
  name: string;
  value: number;
  metal: Metal;
}

/**
 * Generate mock price history data for the last year
 * In Phase 6+, this will use real GoldAPI historical data
 */
export function generatePriceHistoryData(): PriceData[] {
  const data: PriceData[] = [];
  const now = new Date();
  
  // Base prices in PKR per gram
  const baseGoldPrice = 18000; // ~18,000 PKR/g
  const baseSilverPrice = 200;  // ~200 PKR/g
  
  // Generate daily data for the last year
  for (let i = 365; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add some realistic price fluctuation
    const goldFluctuation = Math.sin(i / 30) * 500 + (Math.random() - 0.5) * 200;
    const silverFluctuation = Math.sin(i / 30) * 20 + (Math.random() - 0.5) * 10;
    
    data.push({
      date: date.toISOString().split('T')[0],
      gold: Math.round(baseGoldPrice + goldFluctuation),
      silver: Math.round(baseSilverPrice + silverFluctuation),
    });
  }
  
  return data;
}

/**
 * Generate mock portfolio value history
 * In Phase 6+, this will calculate actual historical portfolio values
 */
export function generatePortfolioValueData(holdings: Holding[]): PortfolioData[] {
  const data: PortfolioData[] = [];
  const now = new Date();
  
  // If no holdings, return empty array
  if (holdings.length === 0) {
    return data;
  }
  
  // Get current total value as base
  const currentTotal = holdings.reduce((sum, h) => {
    const quantityInGrams = convertToGrams(h.quantity, h.unit);
    const estimatedPrice = h.metal === 'gold' ? 18000 : 200;
    return sum + (quantityInGrams * estimatedPrice);
  }, 0);
  
  // Generate monthly data for the last 12 months
  for (let i = 12; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    // Simulate portfolio growth with some fluctuation
    const growthRate = 1 + (i * 0.02); // 2% growth per month
    const fluctuation = (Math.random() - 0.5) * 0.05; // ±2.5% fluctuation
    const value = currentTotal * growthRate * (1 + fluctuation);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value),
    });
  }
  
  return data;
}

/**
 * Calculate metal breakdown for pie chart
 */
export function generateMetalBreakdown(
  holdings: Holding[],
  prices: CurrentPrices
): MetalBreakdown[] {
  const goldValue = holdings
    .filter((h) => h.metal === 'gold')
    .reduce((sum, h) => {
      const grams = convertToGrams(h.quantity, h.unit);
      return sum + (grams * prices.gold.PKR);
    }, 0);
  
  const silverValue = holdings
    .filter((h) => h.metal === 'silver')
    .reduce((sum, h) => {
      const grams = convertToGrams(h.quantity, h.unit);
      return sum + (grams * prices.silver.PKR);
    }, 0);
  
  const breakdown: MetalBreakdown[] = [];
  
  if (goldValue > 0) {
    breakdown.push({
      name: 'Gold',
      value: Math.round(goldValue),
      color: 'hsl(var(--primary))',
    });
  }
  
  if (silverValue > 0) {
    breakdown.push({
      name: 'Silver',
      value: Math.round(silverValue),
      color: 'hsl(var(--muted-foreground))',
    });
  }
  
  return breakdown;
}

/**
 * Calculate individual holdings contribution for bar chart
 */
export function generateHoldingsContribution(
  holdings: Holding[],
  prices: CurrentPrices
): ContributionData[] {
  return holdings.map((h) => {
    const grams = convertToGrams(h.quantity, h.unit);
    const price = h.metal === 'gold' ? prices.gold.PKR : prices.silver.PKR;
    const value = grams * price;
    
    return {
      name: `${h.metal === 'gold' ? 'Gold' : 'Silver'} ${h.purity}`,
      value: Math.round(value),
      metal: h.metal,
    };
  }).sort((a, b) => b.value - a.value); // Sort by value descending
}

/**
 * Helper function to convert units to grams
 */
function convertToGrams(quantity: number, unit: string): number {
  const conversions: Record<string, number> = {
    gram: 1,
    tola: 11.6638,
    ounce: 31.1035,
    kilogram: 1000,
  };
  
  return quantity * (conversions[unit] || 1);
}
