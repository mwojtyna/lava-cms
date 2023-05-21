import { cn } from "@admin/src/utils/styling";
import { ThemeSwitch } from "./ThemeSwitch";
import { TypographyH1 } from "@admin/src/components/ui/server";
import { Form } from "@admin/src/components/ui/client";
import type { UseFormReturn } from "react-hook-form";

interface Props extends React.ComponentPropsWithoutRef<"form"> {
	/** Contents of a `TypographyH1` element */
	titleText: React.ReactNode;
	submitButton: React.ReactNode;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	formData: UseFormReturn<any>;
}

export function SinglePageForm({
	onSubmit,
	className,
	children,
	submitButton,
	titleText,
	formData,
	...props
}: Props) {
	return (
		<Form {...formData}>
			<form onSubmit={onSubmit} className={cn("w-full", className)} {...props}>
				<div className="flex flex-col gap-5">
					<TypographyH1 className="mb-4">{titleText}</TypographyH1>

					<div className="space-y-6">{children}</div>

					<div className="flex items-center">
						<ThemeSwitch />
						{submitButton}
					</div>
				</div>
			</form>
		</Form>
	);
}
