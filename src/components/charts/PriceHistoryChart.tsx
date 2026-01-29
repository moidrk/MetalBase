'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface PriceData {
  date: string;
  gold: number;
  silver: number;
}

interface PriceHistoryChartProps {
  title?: string;
  currency?: string;
}

export function PriceHistoryChart({ title = "Price History", currency = "PKR" }: PriceHistoryChartProps) {
  const [timeframe, setTimeframe] = useState<'1M' | '6M' | '1Y'>('1M');
  const [data, setData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timeframeToDays = { '1M': 30, '6M': 180, '1Y': 365 };

  useEffect(() => {
    async function fetchPriceHistory() {
      try {
        setLoading(true);
        setError(null);

        const days = timeframeToDays[timeframe];
        const response = await fetch(`/api/prices/history/query?days=${days}&currency=${currency}`);

        if (!response.ok) {
          throw new Error('Failed to fetch price history');
        }

        const historyData = await response.json();
        setData(historyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load price history');
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPriceHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe, currency]);

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
              disabled={loading}
              className={`px-3 py-1 text-sm transition-colors ${
                timeframe === tf
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          <p>No price history data available</p>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
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
              tickFormatter={(value) => `${currency === 'USD' ? '$' : '₨'}${value}`}
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
                `${currency === 'USD' ? '$' : '₨'}${value.toLocaleString()}/g`,
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
      )}
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
