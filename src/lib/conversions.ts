import { Unit } from "../types/portfolio";

export const UNIT_CONVERSIONS: Record<Unit, number> = {
  tola: 11.6638,
  gram: 1,
  ounce: 31.1035,
  kilogram: 1000,
};

export const UNIT_DISPLAY: Record<Unit, string> = {
  tola: "tola",
  gram: "g",
  ounce: "oz",
  kilogram: "kg",
};

export function convertToBaseUnit(quantity: number, unit: Unit): number {
  return quantity * UNIT_CONVERSIONS[unit];
}

export function convertFromBaseUnit(baseQuantity: number, targetUnit: Unit): number {
  return baseQuantity / UNIT_CONVERSIONS[targetUnit];
}

export function getUnitDisplay(unit: Unit): string {
  return UNIT_DISPLAY[unit];
}

export function formatQuantity(quantity: number, unit: Unit): string {
  const baseValue = convertToBaseUnit(quantity, unit);
  if (unit === 'gram') {
    return `${quantity}${getUnitDisplay(unit)}`;
  }
  return `${quantity} ${getUnitDisplay(unit)} (${baseValue.toFixed(2)}g)`;
}
