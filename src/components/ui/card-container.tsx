import * as React from "react"
import { cn } from "../../lib/utils"

interface CardContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "solid"
  padding?: "none" | "small" | "default" | "large"
}

const CardContainer = React.forwardRef<HTMLDivElement, CardContainerProps>(
  ({ className, variant = "default", padding = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl transition-all duration-200",
          {
            "glass-card": variant === "glass",
            "bg-card shadow-md hover:shadow-lg": variant === "solid",
            "bg-white/50 backdrop-blur-sm border border-white/10": variant === "default",
            "p-0": padding === "none",
            "p-3": padding === "small",
            "p-6": padding === "default",
            "p-8": padding === "large",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
CardContainer.displayName = "CardContainer"

export { CardContainer }