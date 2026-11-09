import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[100px] px-2.5 py-0.5 text-[12px] font-medium font-sans uppercase tracking-[0.04em] transition-colors leading-normal select-none",
  {
    variants: {
      variant: {
        neutral:
          "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-transparent",
        success:
          "bg-[var(--success-subtle)] text-[var(--success)] border border-transparent",
        warning:
          "bg-[var(--warning-subtle)] text-[var(--warning)] border border-transparent",
        info:
          "bg-[var(--info-subtle)] text-[var(--info)] border border-transparent",
        terracotta:
          "bg-[var(--terracotta-subtle)] text-[var(--terracotta)] border border-transparent",
        outline:
          "border border-[var(--border-strong)] text-[var(--text-primary)] bg-transparent",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
