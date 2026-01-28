import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ColorVariant = "primary" | "success" | "danger" | "neutral";

interface MetricsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  variant?: ColorVariant;
  className?: string;
}

const variantStyles: Record<ColorVariant, string> = {
  primary: "text-primary",
  success: "text-green-600 dark:text-green-400",
  danger: "text-red-600 dark:text-red-400",
  neutral: "text-foreground",
};

export function MetricsCard({
  title,
  value,
  subtitle,
  trend,
  variant = "primary",
  className,
}: MetricsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <p className={cn("text-3xl font-bold", variantStyles[variant])}>{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              <span
                className={cn(
                  "text-sm font-medium",
                  trend.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}
              >
                {trend.value}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
