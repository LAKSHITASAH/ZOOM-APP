import * as React from "react";
import { cn } from "../../lib/utils";

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  const variants = {
    default:
      "bg-blue-600 text-white hover:bg-blue-500 shadow-sm shadow-blue-500/10",
    secondary:
      "bg-white/10 text-white hover:bg-white/15 border border-white/15",
    outline:
      "bg-transparent text-white border border-white/20 hover:bg-white/10",
    ghost: "bg-transparent text-white hover:bg-white/10",
  };

  const sizes = {
    default: "h-11 px-5 rounded-xl text-sm font-semibold",
    sm: "h-9 px-4 rounded-lg text-sm font-semibold",
    lg: "h-12 px-6 rounded-xl text-base font-semibold",
    icon: "h-10 w-10 rounded-xl",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
