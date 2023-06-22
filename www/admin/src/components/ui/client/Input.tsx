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
	}
);

interface InputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "children" | "size">,
		VariantProps<typeof inputVariants> {
	icon?: React.ReactNode;
	rightButtonIconOn?: React.ReactNode;
	rightButtonIconOff?: React.ReactNode;
	rightButtonState?: boolean;
	setRightButtonState?: (state: boolean) => void;
	rightButtonTooltip?: React.ReactNode;
}
const Input = React.forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className,
			type = "text",
			icon,
			size,
			rightButtonIconOff,
			rightButtonIconOn,
			rightButtonTooltip,
			rightButtonState,
			setRightButtonState,
			...props
		},
		ref
	) => {
		const [passwordVisible, setPasswordVisible] = React.useState(false);

		return (
			<div className="relative flex w-full items-center justify-center">
				{icon && <div className="absolute left-3 w-5">{icon}</div>}

				<input
					type={type === "password" ? (passwordVisible ? "text" : "password") : type}
					className={cn(inputVariants({ className, size }), icon && "pl-10")}
					ref={ref}
					{...props}
				/>

				{type === "password" ? (
					<ActionIcon
						className="absolute right-2"
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
					rightButtonIconOn &&
					rightButtonIconOff && (
						<Tooltip>
							<TooltipTrigger asChild>
								<ActionIcon
									className="absolute right-2"
									onClick={() => {
										setRightButtonState!(!rightButtonState);
									}}
									size={size}
								>
									{rightButtonState ? rightButtonIconOn : rightButtonIconOff}
								</ActionIcon>
							</TooltipTrigger>

							<TooltipContent>{rightButtonTooltip}</TooltipContent>
						</Tooltip>
					)
				)}
			</div>
		);
	}
);
Input.displayName = "Input";

export { Input };
