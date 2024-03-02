import type { UseFormReturn } from "react-hook-form";
import { FormProvider } from "@/src/components/ui/client/Form";
import { TypographyH1 } from "@/src/components/ui/server/typography";
import { cn } from "@/src/utils/styling";
import { ThemeSwitch } from "./ThemeSwitch";

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
		<FormProvider {...formData}>
			<form onSubmit={onSubmit} className={cn("w-full", className)} {...props}>
				<div className="flex flex-col gap-6">
					<TypographyH1 className="mb-2">{titleText}</TypographyH1>

					<div className="space-y-6">{children}</div>

					<div className="flex items-center">
						<ThemeSwitch />
						{submitButton}
					</div>
				</div>
			</form>
		</FormProvider>
	);
}
