"use client";

import * as React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { cn } from "@admin/src/utils/styling";
import { type InputBaseProps, InputWrapper } from "./Input";
import { type VariantProps, cva } from "class-variance-authority";

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
	}
);

type TextareaProps = React.ComponentPropsWithRef<typeof TextareaAutosize> &
	InputBaseProps &
	VariantProps<typeof textAreaVariants>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, label, error, withAsterisk, size, ...props }, ref) => {
		return (
			<InputWrapper label={label} error={error} withAsterisk={withAsterisk}>
				{(inputId, errorId) => (
					<TextareaAutosize
						id={inputId}
						className={cn(
							error && "border-destructive",
							textAreaVariants({ className, size })
						)}
						ref={ref}
						{...props}
						aria-invalid={!!error}
						aria-describedby={error ? errorId : undefined}
					/>
				)}
			</InputWrapper>
		);
	}
);
Textarea.displayName = "Textarea";

export { Textarea };
