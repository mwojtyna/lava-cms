"use client";

import type { VariantProps } from "class-variance-authority";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import React from "react";
import { NumericFormat, type NumericFormatProps } from "react-number-format";
import { cn } from "@/src/utils/styling";
import { ActionIcon } from "./ActionIcon";
import { inputVariants } from "./Input";
import type { ClassValue } from "clsx";

const getRestorableNumberInputProps = (edited: boolean, restore: () => void): NumberInputProps => ({
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

interface NumberInputProps
	extends Omit<NumericFormatProps, "children" | "size">,
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

function NumberInput({
	className,
	icon,
	size,
	rightButton,
	inputClassName,
	...props
}: NumberInputProps) {
	return (
		<div className={cn("relative flex h-fit w-full items-center justify-center", className)}>
			{icon && <div className="absolute left-3 w-5">{icon}</div>}

			<NumericFormat
				className={cn(
					inputVariants({ className: inputClassName, size }),
					"pr-10",
					!!icon && "pl-10",
					// Fix for red borders not showing up when form is invalid
					className?.includes("border-destructive") && "border-destructive",
				)}
				{...props}
			/>

			{rightButton && (rightButton.state ? rightButton.iconOn : rightButton.iconOff) && (
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
			)}
		</div>
	);
}
NumberInput.displayName = "NumberInput";

export { NumberInput, getRestorableNumberInputProps };
