"use client";

import * as React from "react";
import { cn } from "@/src/utils/styling";
import { Button } from "./Button";
import { Tooltip, TooltipContent, TooltipPortal, TooltipTrigger } from "./Tooltip";

interface ActionIconProps extends Omit<React.ComponentPropsWithoutRef<typeof Button>, "icon"> {
	tooltip?: string;
}

const ActionIcon = React.forwardRef<HTMLButtonElement, ActionIconProps>(
	({ className, children, variant = "ghost", tooltip, ...props }, ref) => {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						ref={ref}
						className={cn("h-auto w-fit rounded-md p-2 hover:bg-muted", className)}
						variant={variant}
						aria-label={tooltip}
						{...props}
					>
						{children}
					</Button>
				</TooltipTrigger>

				{tooltip && (
					<TooltipPortal>
						<TooltipContent>{tooltip}</TooltipContent>
					</TooltipPortal>
				)}
			</Tooltip>
		);
	},
);
ActionIcon.displayName = "ActionIcon";

export { ActionIcon };
