import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent text-sm font-bold whitespace-nowrap transition-all outline-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "btn-sunset text-white shadow-md hover:scale-[1.02] active:scale-[0.98]",
        outline: "btn-secondary-glass",
        secondary: "btn-secondary-glass",
        ghost: "hover:bg-orange-50 hover:text-orange-600 rounded-full",
        destructive:
          "bg-rose-500 text-white hover:bg-rose-600 rounded-full shadow-xs",
        link: "text-orange-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-11 px-6 py-2",
        xs: "min-h-7 px-3 text-xs",
        sm: "min-h-9 px-4 text-xs",
        lg: "min-h-12 px-7 text-base",
        icon: "size-10 rounded-full",
        "icon-xs": "size-7 rounded-full",
        "icon-sm": "size-8 rounded-full",
        "icon-lg": "size-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
