import { Currency, Metal } from "@/types/portfolio";

export interface CurrentPrices {
  gold: { USD: number; PKR: number }; // per gram
  silver: { USD: number; PKR: number }; // per gram
  updatedAt: string;
}

// Mock prices for development (Phase 3)
// Gold: $65 USD per gram ($2,023 USD per troy oz)
// Silver: $0.85 USD per gram ($26.46 USD per troy oz)
// 1 USD = 278 PKR (placeholder conversion)
export const MOCK_PRICES: CurrentPrices = {
  gold: {
    USD: 65,
    PKR: 65 * 278,
  },
  silver: {
    USD: 0.85,
    PKR: 0.85 * 278,
  },
  updatedAt: new Date().toISOString(),
};

// Helper function to get price for a specific metal and currency
export function getPrice(metal: Metal, currency: Currency): number {
  return MOCK_PRICES[metal][currency];
}
