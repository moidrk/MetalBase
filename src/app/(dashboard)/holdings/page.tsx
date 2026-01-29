'use client';

import { useEffect, useState } from 'react';
import { HoldingsList } from '@/components/portfolio/HoldingsList';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Holding } from '@/types/portfolio';

export default function HoldingsPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHoldings();
  }, []);

  async function fetchHoldings() {
    try {
      setLoading(true);
      const response = await fetch('/api/holdings');
      if (!response.ok) throw new Error('Failed to fetch holdings');
      const data = await response.json();
      setHoldings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading holdings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-destructive/15 p-6 rounded-lg border border-destructive/20 flex flex-col items-center text-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error loading holdings</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={fetchHoldings} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Holdings</h1>
          <p className="text-muted-foreground mt-2">Manage your precious metals portfolio</p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Link href="/holdings/new">
            <Plus className="h-4 w-4" />
            New Holding
          </Link>
        </Button>
      </div>

      <HoldingsList initialHoldings={holdings} />
    </div>
  );
}
