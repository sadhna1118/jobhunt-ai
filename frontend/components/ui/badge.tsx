import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-indigo-600 text-white hover:bg-indigo-700",
        secondary: "border-transparent bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
        destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
        outline: "text-gray-700 border-gray-200",
        success: "border-transparent bg-emerald-500 text-white",
        successLight: "border-transparent bg-emerald-50 text-emerald-700 border-emerald-200",
        warning: "border-transparent bg-amber-500 text-white",
        warningLight: "border-transparent bg-amber-50 text-amber-700 border-amber-200",
        purple: "border-transparent bg-purple-50 text-purple-700 border-purple-200",
        blue: "border-transparent bg-blue-50 text-blue-700 border-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
