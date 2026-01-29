'use client';

import { useEffect, useState } from 'react';
import { HoldingForm } from "@/components/portfolio/HoldingForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Holding } from "@/types/portfolio";

export default function EditHoldingPage() {
  const params = useParams();
  const id = params.id as string;
  const [holding, setHolding] = useState<Holding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHolding() {
      try {
        const response = await fetch(`/api/holdings/${id}`);
        if (!response.ok) throw new Error('Failed to fetch holding');
        const data = await response.json();
        setHolding(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchHolding();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !holding) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-destructive/15 p-6 rounded-lg border border-destructive/20 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground mb-6">{error || 'Holding not found'}</p>
          <Button asChild variant="outline">
            <Link href="/holdings">Back to Holdings</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/holdings">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Holding</h1>
      </div>

      <HoldingForm initialData={holding} isEditing />
    </div>
  );
}
