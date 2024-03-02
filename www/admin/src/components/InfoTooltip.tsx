"use client";

import type { PopoverTrigger } from "./ui/client/Popover";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../utils/styling";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/client/Tooltip";

interface InfoTooltipProps
	extends React.ComponentPropsWithoutRef<typeof Tooltip>,
		VariantProps<typeof variants> {
	className?: string;
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
	({ className, iconClassName, size, children }, ref) => (
		<Tooltip>
			<TooltipTrigger ref={ref} className="cursor-help" aria-label="More information">
				<QuestionMarkCircleIcon className={variants({ className: iconClassName, size })} />
			</TooltipTrigger>
			<TooltipContent className={cn("font-normal", className)}>{children}</TooltipContent>
		</Tooltip>
	),
);
InfoTooltip.displayName = "InfoTooltip";

export { InfoTooltip };
