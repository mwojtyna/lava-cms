import * as React from "react";
import { cn } from "@admin/src/utils/styles";

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
	currentStep: number;
	steps: string[];
	separator: React.ReactNode;
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
	({ children, className, currentStep, steps, separator, ...props }, ref) => (
		<div ref={ref} className={cn("flex gap-2", className)} {...props}>
			{steps.map((step, i) => (
				<React.Fragment key={i}>
					<span className={cn(currentStep !== i && "text-muted-foreground")}>{step}</span>{" "}
					{i < steps.length - 1 && separator}
				</React.Fragment>
			))}
		</div>
	)
);
Stepper.displayName = "Stepper";

export { Stepper };
