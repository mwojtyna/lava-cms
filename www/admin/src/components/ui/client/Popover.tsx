"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const popoverVariants = cva(
	"z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
	{
		variants: {
			variant: {
				default: "w-72 p-4",
				tooltip: "!w-fit px-3 py-1.5 text-sm",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

const PopoverContent = React.forwardRef<
	React.ElementRef<typeof PopoverPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> &
		VariantProps<typeof popoverVariants>
>(({ className, align = "center", sideOffset = 4, variant, side, ...props }, ref) => (
	<PopoverPrimitive.Portal>
		<PopoverPrimitive.Content
			ref={ref}
			align={align}
			sideOffset={sideOffset}
			className={popoverVariants({ className, variant })}
			side={variant === "tooltip" && !side ? "top" : side}
			{...props}
		/>
	</PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

const PopoverAnchor = PopoverPrimitive.Anchor;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, popoverVariants };
