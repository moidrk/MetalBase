"use client";

import { useState, useEffect } from "react";
import { Currency, Unit } from "@/types/portfolio";

export interface UserPreferences {
  id: string;
  user_id: string;
  currency: Currency | "BOTH";
  unit: Unit;
  price_alert_threshold: number;
  push_notifications: boolean;
  notification_frequency: "daily" | "weekly" | "monthly" | "never";
  created_at: string;
  updated_at: string;
}

export interface UsePreferencesResult {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  refetch: () => Promise<void>;
  formatWithCurrency: (amount: number, currencyOverride?: Currency) => string;
}

export function usePreferences(): UsePreferencesResult {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/user/preferences");
      if (!response.ok) {
        throw new Error("Failed to fetch preferences");
      }
      const data = await response.json();
      setPreferences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching preferences:", err);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    try {
      setError(null);
      const response = await fetch("/api/user/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update preferences");
      }

      const data = await response.json();
      setPreferences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const formatWithCurrency = (amount: number, currencyOverride?: Currency): string => {
    const currency = currencyOverride || (preferences?.currency === "BOTH" ? "PKR" : preferences?.currency || "PKR");

    if (currency === "USD") {
      return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `₨${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refetch: fetchPreferences,
    formatWithCurrency,
  };
}
