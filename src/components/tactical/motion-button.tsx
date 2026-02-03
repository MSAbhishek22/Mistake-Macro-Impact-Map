import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { VariantProps } from "class-variance-authority"

export interface MotionButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  pulse?: boolean;
}

const MotionButton = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ className, variant, size, asChild = false, pulse = false, ...props }, ref) => {
    // If asChild is true, we would need to handle it differently, 
    // but for now we'll assume we render a motion.button. 
    // Shadcn's Button uses Slot for asChild, which is tricky with motion.
    // We will ignore asChild for motion button for now or just render motion.button.
    
    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }), "cursor-pointer")}
        animate={pulse ? {
          scale: [1, 1.02, 1],
          boxShadow: [
            "0 0 0px var(--primary)",
            "0 0 10px var(--primary)",
            "0 0 0px var(--primary)"
          ]
        } : undefined}
        transition={pulse ? {
          duration: 2,
          repeat: Infinity,
          repeatDelay: 4, // 2s anim + 4s delay = 6s cycle
          ease: "easeInOut"
        } : { duration: 0.15 }}
        whileHover={{ 
          y: -1,
          boxShadow: "0 0 12px var(--primary)",
          transition: { duration: 0.15 }
        }}
        whileTap={{ 
          scale: 0.98,
          boxShadow: "0 0 8px var(--primary)",
          transition: { duration: 0.1 }
        }}
        {...props}
      />
    )
  }
)
MotionButton.displayName = "MotionButton"

export { MotionButton }
