// src/components/ui/tooltip.jsx
import React from "react";
import { cn } from "@/lib/utils";

const TooltipProvider = ({ children }) => children;

const Tooltip = ({ children }) => children;

const TooltipTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("inline-block", className)} {...props}>
      {children}
    </div>
  );
});
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };