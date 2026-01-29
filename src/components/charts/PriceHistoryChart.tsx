'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

interface PriceData {
  date: string;
  gold: number;
  silver: number;
}

interface PriceHistoryChartProps {
  data: PriceData[];
  title?: string;
}

export function PriceHistoryChart({ data, title = "Price History" }: PriceHistoryChartProps) {
  const [timeframe, setTimeframe] = useState<'1M' | '6M' | '1Y'>('1M');

  const filteredData = filterByTimeframe(data, timeframe);

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex gap-2">
          {(['1M', '6M', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-sm transition-colors ${
                timeframe === tf
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `₨${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0',
              color: 'hsl(var(--foreground))',
            }}
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value: number | undefined, name: string | undefined) => value && name ? [
              `₨${value.toLocaleString()}/g`,
              name === 'gold' ? 'Gold' : 'Silver'
            ] : ['', '']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="gold"
            stroke="hsl(var(--primary))"
            dot={false}
            strokeWidth={2}
            name="Gold"
          />
          <Line
            type="monotone"
            dataKey="silver"
            stroke="hsl(var(--muted-foreground))"
            dot={false}
            strokeWidth={2}
            name="Silver"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

function filterByTimeframe(data: PriceData[], timeframe: '1M' | '6M' | '1Y') {
  const now = new Date();
  let cutoffDate: Date;

  if (timeframe === '1M') {
    cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  } else if (timeframe === '6M') {
    cutoffDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  } else {
    cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }

  return data.filter((item) => new Date(item.date) >= cutoffDate);
}
