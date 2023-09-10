"use client";

import * as React from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@admin/src/utils/styling";
import { Tooltip, TooltipContent, TooltipTrigger } from "../client";
import { ActionIcon } from "./ActionIcon";

const inputVariants = cva(
	"flex w-full rounded-md border border-input bg-transparent px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
	{
		variants: {
			size: {
				sm: "h-9 text-sm",
				md: "h-10 text-sm",
				lg: "h-11 text-base",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
);

interface InputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "children" | "size">,
		VariantProps<typeof inputVariants> {
	inputClassName?: string;
	icon?: React.ReactNode;
	rightButton?: {
		iconOn: React.ReactNode;
		iconOff: React.ReactNode;
		tooltip: React.ReactNode;
		state: boolean;
	} & (
		| {
				onClick: null;
				setState: (state: boolean) => void;
		  }
		| {
				onClick: () => void;
				setState: null;
		  }
	);
}
const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type = "text", icon, size, rightButton, inputClassName, ...props }, ref) => {
		const [passwordVisible, setPasswordVisible] = React.useState(false);

		return (
			<div className={cn("relative flex w-full items-center justify-center", className)}>
				{icon && <div className="absolute left-3 w-5">{icon}</div>}

				<input
					type={type === "password" ? (passwordVisible ? "text" : "password") : type}
					className={cn(
						inputVariants({ size }),
						icon && "pl-10",
						inputClassName,
						// Fix for red borders not showing up when form is invalid
						className?.includes("border-destructive") && "border-destructive",
					)}
					ref={ref}
					{...props}
				/>

				{type === "password" ? (
					<ActionIcon
						className="absolute right-1.5 bg-background"
						onClick={() => setPasswordVisible(!passwordVisible)}
						size={size}
						aria-label="Toggle password visibility"
					>
						{passwordVisible ? (
							<EyeSlashIcon className="w-5" />
						) : (
							<EyeIcon className="w-5" />
						)}
					</ActionIcon>
				) : (
					rightButton && (
						<Tooltip>
							<TooltipTrigger asChild>
								<ActionIcon
									className="absolute right-1.5 bg-background"
									onClick={() => {
										if (!rightButton.onClick) {
											rightButton.setState(!rightButton.state);
										} else {
											rightButton.onClick();
										}
									}}
									size={size}
								>
									{rightButton.state ? rightButton.iconOn : rightButton.iconOff}
								</ActionIcon>
							</TooltipTrigger>

							<TooltipContent className="font-sans">
								{rightButton.tooltip}
							</TooltipContent>
						</Tooltip>
					)
				)}
			</div>
		);
	},
);
Input.displayName = "Input";

export { Input };
