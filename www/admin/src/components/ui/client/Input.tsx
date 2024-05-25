"use client";

import { ArrowUturnLeftIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/src/utils/styling";
import { ActionIcon } from "./ActionIcon";
import type { ClassValue } from "clsx";

const inputVariants = cva(
	"flex w-full rounded-md border border-input bg-transparent px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
	{
		variants: {
			size: {
				sm: "h-9 text-sm",
				md: "h-10 text-sm",
				lg: "h-11 text-base",
			},
			variant: {
				default:
					"border border-input ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				ghost: "border-none focus-visible:ring-transparent",
			},
		},
		defaultVariants: {
			size: "md",
			variant: "default",
		},
	},
);

const getRestorableInputProps = (edited: boolean, restore: () => void): InputProps => ({
	inputClassName: cn("transition-colors", edited && "border-b-brand"),
	rightButton: {
		iconOn: <ArrowUturnLeftIcon className="w-4" />,
		iconOff: null,
		tooltip: "Restore",
		onClick: restore,
		state: edited,
		setState: null,
	},
});

interface InputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "children" | "size">,
		VariantProps<typeof inputVariants> {
	inputClassName?: string;
	icon?: React.ReactNode;
	rightButton?: {
		iconOn: React.ReactNode;
		iconOff: React.ReactNode;
		tooltip: string;
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
			<div
				className={cn("relative flex h-fit w-full items-center justify-center", className)}
			>
				{icon && <div className="absolute left-3 w-5">{icon}</div>}

				<input
					type={type === "password" ? (passwordVisible ? "text" : "password") : type}
					className={cn(
						inputVariants({ className: inputClassName, size }),
						"pr-10",
						!!icon && "pl-10",
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
					rightButton &&
					(rightButton.state ? rightButton.iconOn : rightButton.iconOff) && (
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
							tooltip={rightButton.tooltip}
						>
							{rightButton.state ? rightButton.iconOn : rightButton.iconOff}
						</ActionIcon>
					)
				)}
			</div>
		);
	},
);
Input.displayName = "Input";

export { Input, getRestorableInputProps, inputVariants };
