import { Currency, Unit } from "@/types/portfolio";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  PKR: "₨",
  USD: "$",
};

export function formatCurrency(value: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const formatted = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const sign = value >= 0 ? "" : "-";
  return `${sign}${symbol}${formatted}`;
}

export function formatCurrencyWithSign(
  value: number,
  currency: Currency
): string {
  if (value >= 0) {
    return `+${formatCurrency(value, currency)}`;
  }
  return formatCurrency(value, currency);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  const formatted = Math.abs(value).toFixed(decimals);
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${formatted}%`;
}

export function formatWeight(grams: number, unit: Unit): string {
  const value = grams / (unit === "kilogram" ? 1000 : grams);
  const unitSymbol = unit === "gram" ? "g" : unit === "tola" ? "tola" : unit === "ounce" ? "oz" : "kg";

  if (unit === "gram") {
    return `${grams.toFixed(2)}g`;
  }
  const converted = grams / (unit === "tola" ? 11.6638 : unit === "ounce" ? 31.1035 : 1000);
  return `${converted.toFixed(2)} ${unitSymbol}`;
}

export function formatWeightWithConversion(
  grams: number,
  originalUnit: Unit
): string {
  const originalQuantity = grams / (originalUnit === "kilogram" ? 1000 : grams);
  const conversionFactor =
    originalUnit === "gram"
      ? 1
      : originalUnit === "tola"
      ? 11.6638
      : originalUnit === "ounce"
      ? 31.1035
      : 1000;

  const convertedValue = grams / conversionFactor;

  if (originalUnit === "gram") {
    return `${grams.toFixed(2)}g`;
  }

  return `${convertedValue.toFixed(2)} ${originalUnit === "kilogram" ? "kg" : originalUnit} (${grams.toFixed(2)}g)`;
}
