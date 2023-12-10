"use client";

import * as SwitchPrimitives from "@radix-ui/react-switch";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "@admin/src/utils/styling";

const switchVariants = cva(
	"peer relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
	{
		variants: {
			size: {
				lg: "h-8 w-16",
				md: "h-6 w-11",
			},
		},
		defaultVariants: {
			size: "md",
		},
	}
);

interface SwitchProps
	extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
		VariantProps<typeof switchVariants> {
	iconOn?: React.ReactNode;
	iconOff?: React.ReactNode;
	label?: React.ReactNode;
	withAsterisk?: boolean;
}

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
	({ className, iconOn, iconOff, size = "md", label, withAsterisk, ...props }, ref) => (
		<SwitchPrimitives.Root className={switchVariants({ size, className })} {...props} ref={ref}>
			<span
				className={cn(
					"absolute left-4 top-1/2 w-5 -translate-x-1/2 -translate-y-1/2",
					size === "md" && "left-[10px] w-4"
				)}
			>
				{iconOn}
			</span>
			<SwitchPrimitives.Thumb
				className={cn(
					"pointer-events-none z-10 block h-6 w-6 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-[34px] data-[state=unchecked]:translate-x-[2px]",
					size === "md" &&
						"h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
				)}
			/>
			<span
				className={cn(
					"absolute left-11 top-1/2 w-5 -translate-x-1/2 -translate-y-1/2",
					size === "md" && "left-[30px] w-4"
				)}
			>
				{iconOff}
			</span>
		</SwitchPrimitives.Root>
	)
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
