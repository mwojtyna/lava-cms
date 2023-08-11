"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@admin/src/utils/styling";
import { Loader } from "../server/Loader";

const buttonVariants = cva(
	"active:translate-y-px inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
				outline:
					"outline outline-1 outline-input hover:bg-accent hover:text-accent-foreground",
				secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost: "hover:bg-accent hover:text-accent-foreground",
				link: "underline-offset-4 hover:underline text-primary !p-0 !h-fit",
			},
			size: {
				md: "h-10 py-2 px-4 text-sm gap-2",
				sm: "h-9 px-3 rounded-md text-sm gap-1",
				lg: "h-11 px-4 rounded-md text-base gap-3",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
		},
	},
);

interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	icon?: React.ReactNode;
	loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			size,
			asChild = false,
			type = "button",
			icon,
			children,
			loading,
			disabled,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : "button";

		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				type={type}
				// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
				disabled={loading || disabled}
				{...props}
			>
				{asChild ? (
					<span>
						{loading ? <Loader /> : icon}
						{children}
					</span>
				) : (
					<>
						{loading ? <Loader /> : icon}
						{children}
					</>
				)}
			</Comp>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
