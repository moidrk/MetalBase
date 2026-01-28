import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "bg-destructive/15 text-destructive border border-destructive/25 px-4 py-3 rounded-lg flex items-center gap-3 text-sm",
  {
    variants: {
      variant: {
        default: "",
        destructive: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
);
Alert.displayName = "Alert";

export { Alert, cardVariants };
