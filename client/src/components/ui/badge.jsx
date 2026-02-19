import * as React from "react";
import { cn } from "../../lib/utils";

export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/90",
        className
      )}
      {...props}
    />
  );
}
