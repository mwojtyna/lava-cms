"use client";

import * as React from "react";
import { cn } from "@admin/src/utils/styling";
import { Button } from "./Button";

type ActionIconProps = React.ComponentPropsWithoutRef<typeof Button>;

const ActionIcon = React.forwardRef<HTMLButtonElement, ActionIconProps>(
	({ className, children, variant = "ghost", ...props }, ref) => {
		return (
			<Button
				ref={ref}
				className={cn("h-auto w-fit rounded-sm p-1 hover:bg-muted", className)}
				variant={variant}
				{...props}
			>
				{children}
			</Button>
		);
	}
);
ActionIcon.displayName = "ActionIcon";

export { ActionIcon };
