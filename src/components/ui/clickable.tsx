import { cn } from "@/utils/cn";
import { forwardRef } from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => (
    <button
      className={cn(
        className,
        "rounded-md text-sm text-slate-300 bg-slate-800 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-400 dark:focus-visible:ring-offset-slate-900"
      )}
      {...props}
      ref={ref}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;
export const Anchor = forwardRef<HTMLAnchorElement, AnchorProps>(
  ({ className, children, ...props }, ref) => (
    <a
      className={cn(
        className,
        "rounded-md text-sm text-slate-300 bg-slate-800 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-400 dark:focus-visible:ring-offset-slate-900"
      )}
      {...props}
      ref={ref}
    >
      {children}
    </a>
  )
);
Anchor.displayName = "Anchor";
