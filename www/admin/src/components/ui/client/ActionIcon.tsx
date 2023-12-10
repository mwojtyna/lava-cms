"use client";

import * as React from "react";
import { cn } from "@/src/utils/styling";
import { Button } from "./Button";

type ActionIconProps = Omit<React.ComponentPropsWithoutRef<typeof Button>, "icon">;

const ActionIcon = React.forwardRef<HTMLButtonElement, ActionIconProps>(
	({ className, children, variant = "ghost", ...props }, ref) => {
		return (
			<Button
				ref={ref}
				className={cn("h-auto w-fit rounded-md p-2 hover:bg-muted", className)}
				variant={variant}
				{...props}
			>
				{children}
			</Button>
		);
	},
);
ActionIcon.displayName = "ActionIcon";

export { ActionIcon };
