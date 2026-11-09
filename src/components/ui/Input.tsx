import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error = false, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[44px] min-h-[44px] w-full rounded-[8px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2 text-[15px] font-normal font-sans text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-colors duration-150 ease-out focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[rgba(66,91,72,0.15)] disabled:cursor-not-allowed disabled:opacity-45 file:border-0 file:bg-transparent file:text-sm file:font-medium",
          error && "border-[var(--destructive)] focus:border-[var(--destructive)] focus:ring-[rgba(155,35,53,0.15)]",
          className
        )}
        ref={ref}
        aria-invalid={error || props["aria-invalid"]}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
