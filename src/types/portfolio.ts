export type Metal = 'gold' | 'silver';
export type Purity = '24K' | '22K' | '21K' | '18K' | '14K' | '9K' | 'other';
export type Unit = 'tola' | 'gram' | 'ounce' | 'kilogram';
export type Currency = 'PKR' | 'USD';

export interface Holding {
  id: string;
  user_id: string;
  metal: Metal;
  purity: Purity;
  quantity: number;
  unit: Unit;
  buy_price: number;
  currency: Currency;
  buy_date: string; // ISO date
  created_at: string;
  updated_at: string;
  // Calculated fields (from API)
  currentValue?: number;
  profitLoss?: number;
  profitLossPercent?: number;
}

export interface UnitConversion {
  toGram: number;
  displayName: string;
}
