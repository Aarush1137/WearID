import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[8px] text-[15px] font-medium font-sans transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 select-none active:scale-[0.99]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--accent)] text-[var(--text-on-accent)] hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)] border border-transparent shadow-xs",
        secondary:
          "bg-[var(--bg-surface)] text-[var(--accent)] border-[1.5px] border-[var(--accent)] hover:bg-[var(--bg-accent-subtle)] active:bg-[var(--accent-subtle)]",
        ghost:
          "bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] active:bg-[var(--border)] border border-transparent",
        destructive:
          "bg-[var(--destructive)] text-white hover:bg-[#821D2C] active:bg-[#6E1825] border border-transparent shadow-xs",
      },
      size: {
        default: "min-h-[44px] px-5 py-2.5",
        sm: "min-h-[36px] px-3.5 py-1.5 text-xs rounded-[6px]",
        lg: "min-h-[48px] px-6 py-3 text-base rounded-[10px]",
        icon: "min-h-[44px] min-w-[44px] h-[44px] w-[44px] p-2",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
