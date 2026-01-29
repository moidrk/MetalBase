'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatting';
import { Currency } from '@/types/portfolio';

interface PortfolioData {
  date: string;
  value: number;
}

interface PortfolioValueChartProps {
  data: PortfolioData[];
  title?: string;
  currency?: Currency;
}

export function PortfolioValueChart({ 
  data, 
  title = "Portfolio Value Over Time",
  currency = 'PKR'
}: PortfolioValueChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No portfolio data available</p>
        </div>
      </Card>
    );
  }

  const startValue = data[0]?.value || 0;
  const currentValue = data[data.length - 1]?.value || 0;
  const isProfitable = currentValue >= startValue;

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-sm">
          <span className="text-muted-foreground">Start: </span>
          <span className="font-medium">{formatCurrency(startValue, currency)}</span>
          <span className="mx-2">→</span>
          <span className="text-muted-foreground">Current: </span>
          <span className={`font-medium ${isProfitable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(currentValue, currency)}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `₨${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0',
              color: 'hsl(var(--foreground))',
            }}
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value: number | undefined) => value ? [formatCurrency(value, currency), 'Portfolio Value'] : ['', '']}
          />
          <ReferenceLine y={startValue} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
          <Area
            type="monotone"
            dataKey="value"
            fill={isProfitable ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
            stroke={isProfitable ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
            strokeWidth={2}
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
