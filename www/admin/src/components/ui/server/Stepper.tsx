import * as React from "react";
import { cn } from "@admin/src/utils/styling";

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
	currentStep: number;
	steps: React.ReactNode[];
	separator: React.ReactNode;
	firstIsIcon?: boolean;
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
	({ children, className, currentStep, steps, separator, firstIsIcon, ...props }, ref) => (
		<div ref={ref} className={cn("flex items-center gap-2", className)} {...props}>
			{steps.map((step, i) => (
				<React.Fragment key={i}>
					{i === 0 && firstIsIcon ? (
						step
					) : (
						<>
							<span
								className={cn(
									"flex items-center justify-center",
									currentStep !== i && "text-muted-foreground",
								)}
							>
								{step}
							</span>{" "}
						</>
					)}
					{i < steps.length - 1 && (
						<span className={cn(currentStep !== i && "text-muted-foreground")}>
							{separator}
						</span>
					)}
				</React.Fragment>
			))}
		</div>
	),
);
Stepper.displayName = "Stepper";

export { Stepper };
