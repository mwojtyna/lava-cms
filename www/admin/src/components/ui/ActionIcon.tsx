"use client";

import * as React from "react";
import { cn } from "@admin/src/utils/styles";
import { Button } from "./Button";

type ActionIconProps = React.ComponentPropsWithoutRef<"button">;

const ActionIcon = React.forwardRef<HTMLButtonElement, ActionIconProps>(
	({ className, children, ...props }, ref) => {
		return (
			<Button
				ref={ref}
				className={cn("h-auto w-fit rounded-sm p-1 hover:bg-muted", className)}
				variant="ghost"
				{...props}
			>
				{children}
			</Button>
		);
	}
);
ActionIcon.displayName = "ActionIcon";

export { ActionIcon };
