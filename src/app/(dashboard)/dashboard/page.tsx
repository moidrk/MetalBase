'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function DashboardPage() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHoldings();
  }, []);

  async function fetchHoldings() {
    try {
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <button 
            onClick={() => {
              setLoading(true);
              fetchHoldings();
            }}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Portfolio Overview</h1>
      
      {holdings.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No holdings yet</p>
          <Link 
            href="/holdings/new" 
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Add First Holding
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          <p className="text-muted-foreground">You have {holdings.length} holdings</p>
          {/* Holdings list will be implemented in Phase 3+ */}
        </div>
      )}
    </div>
  );
}
