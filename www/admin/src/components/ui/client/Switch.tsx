"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@admin/src/utils/styling";

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
	iconOn?: React.ReactNode;
	iconOff?: React.ReactNode;
}

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
	({ className, iconOn: labelOn, iconOff: labelOff, ...props }, ref) => (
		<SwitchPrimitives.Root
			className={cn(
				"peer relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
				className
			)}
			{...props}
			ref={ref}
		>
			<span className="absolute left-4 top-1/2 w-5 -translate-x-1/2 -translate-y-1/2">
				{labelOn}
			</span>
			<SwitchPrimitives.Thumb
				className={cn(
					"pointer-events-none z-10 block h-6 w-6 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-[34px] data-[state=unchecked]:translate-x-[2px]"
				)}
			/>
			<span className="absolute left-11 top-1/2 w-5 -translate-x-1/2 -translate-y-1/2">
				{labelOff}
			</span>
		</SwitchPrimitives.Root>
	)
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
