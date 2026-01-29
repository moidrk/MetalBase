'use client';

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatting';

interface MetalBreakdown {
  name: string;
  value: number;
  color: string;
}

interface MetalBreakdownChartProps {
  data: MetalBreakdown[];
  title?: string;
}

export function MetalBreakdownChart({ data, title = "Portfolio Breakdown" }: MetalBreakdownChartProps) {
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

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number | undefined) => value ? formatCurrency(value, 'PKR') : ''}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0',
              color: 'hsl(var(--foreground))',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Total Portfolio Value: {formatCurrency(totalValue, 'PKR')}
      </div>
    </Card>
  );
}
