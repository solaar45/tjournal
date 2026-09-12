import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#6979F8] text-white [a&]:hover:bg-[#5868e8]",
        secondary:
          "border-transparent bg-[#E5E7FA] text-[#6979F8] dark:bg-[#2A1E38] dark:text-[#A5AFFB]",
        destructive:
          "border-transparent bg-[#FF647C] text-white",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent",
        success:
          "border-transparent bg-[#D5F2EA] text-[#00C48C] dark:bg-[#122B24] dark:text-[#7DDFC3]",
        danger:
          "border-transparent bg-[#FBE4E8] text-[#FF647C] dark:bg-[#33151D] dark:text-[#FDAFBB]",
        warning:
          "border-transparent bg-[#FFE8DA] text-[#FFA26B] dark:bg-[#311E16] dark:text-[#FFA26B]",
        purple:
          "border-transparent bg-[#EEDFF2] text-[#BE52F2] dark:bg-[#2A1637] dark:text-[#DBA5F5]",
        blue:
          "border-transparent bg-[#E5E7FA] text-[#6979F8] dark:bg-[#1E1B38] dark:text-[#A5AFFB]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
