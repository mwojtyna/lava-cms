import { cn } from "@admin/src/utils/styles";
import { ThemeSwitch } from "@admin/src/components";
import { TypographyH1 } from "./ui/server";

interface Props extends React.ComponentPropsWithoutRef<"form"> {
	/** Contents of a `TypographyH1` element */
	titleText: React.ReactNode;
	submitButton: React.ReactNode;
}

export function SinglePageForm({
	onSubmit,
	className,
	children,
	submitButton,
	titleText,
	...props
}: Props) {
	return (
		<form onSubmit={onSubmit} className={cn("w-full max-w-md px-10", className)} {...props}>
			<div className="flex flex-col gap-5">
				<TypographyH1 className="mb-4">{titleText}</TypographyH1>

				{children}

				<div className="flex items-center">
					<ThemeSwitch />
					{submitButton}
				</div>
			</div>
		</form>
	);
}
