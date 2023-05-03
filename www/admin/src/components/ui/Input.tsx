"use client";

import * as React from "react";
import { cn } from "@admin/src/utils/styles";
import { Label } from "./Label";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { ActionIcon } from "./ActionIcon";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: React.ReactNode;
	icon?: React.ReactNode;
	error?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, label, icon, error, ...props }, ref) => {
		const inputId = React.useId();
		const errorId = React.useId();
		const [showPassword, setShowPassword] = React.useState(false);

		return (
			<div className="grid w-full max-w-sm items-center gap-1.5">
				{label && <Label htmlFor={inputId}>{label}</Label>}

				<div className="relative flex h-11 items-center justify-center">
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
						>
							{showPassword ? (
								<EyeSlashIcon className="w-5" />
							) : (
								<EyeIcon className="w-5" />
							)}
						</ActionIcon>
					)}
				</div>

				{error && (
					<p id={errorId} className="text-sm text-destructive">
						{error}
					</p>
				)}
			</div>
		);
	}
);
Input.displayName = "Input";

export { Input };
