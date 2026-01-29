'use client';

import { useState, useEffect } from 'react';
import { usePreferences } from '@/hooks/usePreferences';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

export default function SettingsPage() {
  const { preferences, loading, error, updatePreferences, refetch } = usePreferences();
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [currency, setCurrency] = useState<string>('PKR');
  const [unit, setUnit] = useState<string>('tola');
  const [priceAlertThreshold, setPriceAlertThreshold] = useState<number>(5);
  const [pushNotifications, setPushNotifications] = useState<boolean>(true);
  const [notificationFrequency, setNotificationFrequency] = useState<string>('daily');

  // Update form state when preferences load
  useEffect(() => {
    if (preferences) {
      setCurrency(preferences.currency);
      setUnit(preferences.unit);
      setPriceAlertThreshold(preferences.price_alert_threshold);
      setPushNotifications(preferences.push_notifications);
      setNotificationFrequency(preferences.notification_frequency);
    }
  }, [preferences]);

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setIsSaving(true);
      await updatePreferences({
        currency: currency as any,
        unit: unit as any,
        price_alert_threshold: priceAlertThreshold,
        push_notifications: pushNotifications,
        notification_frequency: notificationFrequency as any,
      });

      toast.success("Settings saved successfully!");
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="bg-destructive/15 p-6 rounded-lg border border-destructive/20 text-center">
          <Settings className="h-10 w-10 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error loading settings</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={refetch} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <Toaster position="top-center" />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences</p>
      </div>

      {/* Settings Form */}
      <div className="space-y-6 max-w-2xl">
        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Display Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PKR">Pakistani Rupee (PKR)</SelectItem>
                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                  <SelectItem value="BOTH">Both (PKR & USD)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose your preferred currency for displaying prices and values
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Measurement Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tola">Tola</SelectItem>
                  <SelectItem value="gram">Gram</SelectItem>
                  <SelectItem value="ounce">Ounce</SelectItem>
                  <SelectItem value="kilogram">Kilogram</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose your preferred unit for displaying weights and quantities
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Alert Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Price Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="threshold">Price Alert Threshold (%)</Label>
              <Input
                id="threshold"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={priceAlertThreshold}
                onChange={(e) => setPriceAlertThreshold(parseFloat(e.target.value) || 0)}
              />
              <p className="text-sm text-muted-foreground">
                Get notified when prices change by this percentage
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about price updates and alerts
                </p>
              </div>
              <Switch
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Notification Frequency</Label>
              <Select
                value={notificationFrequency}
                onValueChange={setNotificationFrequency}
                disabled={!pushNotifications}
              >
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                How often you want to receive notifications
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
