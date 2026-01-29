'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatting';
import { Metal } from '@/types/portfolio';

interface ContributionData {
  name: string;
  value: number;
  metal: Metal;
}

interface HoldingsContributionChartProps {
  data: ContributionData[];
  title?: string;
}

export function HoldingsContributionChart({ 
  data, 
  title = "Holdings Contribution" 
}: HoldingsContributionChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No holdings data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            type="number"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `₨${(value / 1000).toFixed(0)}k`}
          />
          <YAxis 
            type="category"
            dataKey="name"
            width={120}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0',
              color: 'hsl(var(--foreground))',
            }}
            formatter={(value: number | undefined) => value ? formatCurrency(value, 'PKR') : ''}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.metal === 'gold' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
