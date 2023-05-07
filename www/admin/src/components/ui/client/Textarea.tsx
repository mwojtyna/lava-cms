"use client";

import * as React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { cn } from "@admin/src/utils/styling";
import { type InputBaseProps, InputWrapper } from "./Input";

type TextareaProps = React.ComponentPropsWithRef<typeof TextareaAutosize> & InputBaseProps;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, label, error, withAsterisk, ...props }, ref) => {
		return (
			<InputWrapper label={label} error={error} withAsterisk={withAsterisk}>
				{(inputId, errorId) => (
					<TextareaAutosize
						id={inputId}
						className={cn(
							"flex h-20 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
							error && "border-destructive",
							className
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
