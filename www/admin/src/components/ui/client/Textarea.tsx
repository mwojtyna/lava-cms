"use client";

import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import TextareaAutosize, { type TextareaAutosizeProps } from "react-textarea-autosize";
import { cn } from "@/src/utils/styling";
import { ActionIcon } from "./ActionIcon";

const textAreaVariants = cva(
	"flex h-20 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
	{
		variants: {
			size: {
				default: "text-sm",
				lg: "text-base",
			},
		},
		defaultVariants: {
			size: "default",
		},
	},
);

const getRestorableTextareaProps = (edited: boolean, restore: () => void): TextareaProps => ({
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

type Extending = TextareaAutosizeProps & VariantProps<typeof textAreaVariants>;
interface TextareaProps extends Extending {
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

const MIN_HEIGHT_EM = 2.85;
const PX_PER_ROW = 21.8;
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ inputClassName, className, size, rightButton, ...props }, ref) => {
		return (
			<div
				className={cn("relative flex h-fit w-full items-center justify-center", className)}
			>
				<TextareaAutosize
					className={cn(
						textAreaVariants({ className: inputClassName, size }),
						`min-h-[${MIN_HEIGHT_EM}em] resize-y pr-6 pt-2`,
						props.maxRows && `max-h-[${props.maxRows * PX_PER_ROW}px]`,
					)}
					ref={ref}
					// Filter out new lines, because they won't render in frontend properly
					// without css rules, and it would be confusing to the user
					{...props}
				/>

				{rightButton && (rightButton.state ? rightButton.iconOn : rightButton.iconOff) && (
					<ActionIcon
						className="absolute bottom-[3px] right-3 bg-background/50"
						onClick={() => {
							if (!rightButton.onClick) {
								rightButton.setState(!rightButton.state);
							} else {
								rightButton.onClick();
							}
						}}
						tooltip={rightButton.tooltip}
					>
						{rightButton.state ? rightButton.iconOn : rightButton.iconOff}
					</ActionIcon>
				)}
			</div>
		);
	},
);
Textarea.displayName = "Textarea";

export { Textarea, getRestorableTextareaProps };
