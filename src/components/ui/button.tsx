import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-[#6979F8] text-white hover:bg-[#5868e8] shadow-sm shadow-[#6979F8]/25 font-semibold",
        gradient: "bg-gradient-eggplore text-white shadow-sm shadow-[#6979F8]/30 hover:opacity-95 font-semibold",
        destructive:
          "bg-[#FF647C] text-white hover:bg-[#eb526a] shadow-sm shadow-[#FF647C]/25 font-semibold focus-visible:ring-destructive/20",
        outline:
          "border border-border/80 bg-card hover:bg-muted text-foreground font-medium shadow-2xs",
        secondary:
          "bg-[#E5E7FA] text-[#6979F8] hover:bg-[#d8dbf7] dark:bg-[#2A1E38] dark:text-[#A5AFFB] dark:hover:bg-[#342646] font-semibold",
        ghost:
          "hover:bg-muted hover:text-foreground text-muted-foreground",
        link: "text-[#6979F8] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-11 rounded-xl px-6 has-[>svg]:px-4 text-base font-semibold",
        icon: "size-9 rounded-xl",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
