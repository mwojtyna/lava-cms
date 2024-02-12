"use client";

import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/client/Popover";

interface InfoTooltipProps
	extends React.ComponentPropsWithoutRef<typeof Popover>,
		VariantProps<typeof variants> {
	iconClassName?: string;
}

const variants = cva("", {
	variants: {
		size: {
			default: "w-4",
			lg: "w-5",
		},
	},
	defaultVariants: {
		size: "default",
	},
});

const InfoTooltip = React.forwardRef<React.ComponentRef<typeof PopoverTrigger>, InfoTooltipProps>(
	({ iconClassName, size, children }, ref) => (
		<Popover>
			<PopoverTrigger ref={ref} aria-label="More information">
				<QuestionMarkCircleIcon className={variants({ className: iconClassName, size })} />
			</PopoverTrigger>
			<PopoverContent variant={"tooltip"}>{children}</PopoverContent>
		</Popover>
	),
);
InfoTooltip.displayName = "InfoTooltip";

export { InfoTooltip };
