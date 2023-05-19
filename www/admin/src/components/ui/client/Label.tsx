import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { type VariantProps, cva } from "class-variance-authority";

const labelVariants = cva(
	"font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
	{
		variants: {
			size: {
				sm: "text-sm",
				md: "text-sm",
				lg: "text-base",
			},
		},
		defaultVariants: {
			size: "md",
		},
	}
);

const Label = React.forwardRef<
	React.ElementRef<typeof LabelPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, size, ...props }, ref) => (
	<LabelPrimitive.Root ref={ref} className={labelVariants({ className, size })} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
