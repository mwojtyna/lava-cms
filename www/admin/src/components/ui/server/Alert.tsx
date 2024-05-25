import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/src/utils/styling";

const alertVariants = cva(
	"relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:text-foreground [&>svg]:left-4 [&>svg]:top-[14px] [&>svg+div]:translate-y-[-3px]",
	{
		variants: {
			variant: {
				default: "bg-background text-foreground",
				destructive:
					"text-destructive border-destructive/50 dark:border-destructive [&>svg]:text-destructive text-destructive",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

interface AlertProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof alertVariants> {
	icon?: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
	({ className, variant, children, icon, ...props }, ref) => (
		<div
			ref={ref}
			role="alert"
			className={cn(alertVariants({ variant }), className, !!icon && "pl-11")}
			{...props}
		>
			{icon}
			{children}
		</div>
	),
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({ className, ...props }, ref) => (
		<h5
			ref={ref}
			className={cn("mb-1 font-medium leading-none tracking-tight", className)}
			{...props}
		/>
	),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
