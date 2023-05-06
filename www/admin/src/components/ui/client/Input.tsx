"use client";

import * as React from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { cn } from "@admin/src/utils/styles";
import { Label } from "../client";
import { ActionIcon } from "./ActionIcon";

interface InputWrapperProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "children"> {
	label?: React.ReactNode;
	error?: React.ReactNode;
	withAsterisk?: boolean;
	children: (inputId: string, errorId: string) => React.ReactNode;
}
type InputBaseProps = Omit<InputWrapperProps, "children">;

const InputWrapper = React.forwardRef<HTMLDivElement, InputWrapperProps>(
	({ className, label, error, children, withAsterisk, ...props }, ref) => {
		const inputId = React.useId();
		const errorId = React.useId();

		return (
			<div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props}>
				{label && (
					<Label htmlFor={inputId} className="flex">
						<span className="flex items-center">{label}</span>
						{withAsterisk && <span className="text-destructive">&nbsp;*</span>}
					</Label>
				)}

				{children(inputId, errorId)}

				{typeof error !== "boolean" && (
					<p id={errorId} className="text-sm text-destructive">
						{error}
					</p>
				)}
			</div>
		);
	}
);
InputWrapper.displayName = "InputWrapper";

interface InputProps extends Omit<InputWrapperProps, "children"> {
	icon?: React.ReactNode;
}
const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, label, icon, error, withAsterisk, ...props }, ref) => {
		const [showPassword, setShowPassword] = React.useState(false);

		return (
			<InputWrapper label={label} error={error} withAsterisk={withAsterisk}>
				{(inputId, errorId) => (
					<div className="relative flex h-11 w-full items-center justify-center">
						{icon && <div className="absolute left-3 w-5">{icon}</div>}
						<input
							type={type === "password" ? (showPassword ? "text" : "password") : type}
							id={inputId}
							className={cn(
								"flex h-full w-full rounded-md border border-input bg-transparent px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
								className,
								icon && "pl-10",
								error && "border-destructive"
							)}
							ref={ref}
							{...props}
							aria-invalid={!!error}
							aria-describedby={error ? errorId : undefined}
						/>
						{type === "password" && (
							<ActionIcon
								className="absolute right-2"
								onClick={() => setShowPassword(!showPassword)}
								aria-label="Toggle password visibility"
							>
								{showPassword ? (
									<EyeSlashIcon className="w-5" />
								) : (
									<EyeIcon className="w-5" />
								)}
							</ActionIcon>
						)}
					</div>
				)}
			</InputWrapper>
		);
	}
);
Input.displayName = "Input";

export { Input, InputWrapper, type InputBaseProps };
