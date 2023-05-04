import { cn } from "@admin/src/utils/styles";

export function TypographyH1({
	className,
	children,
	...props
}: React.ComponentPropsWithoutRef<"h1">) {
	return (
		<h1
			className={cn("scroll-m-20 text-5xl font-extrabold tracking-tight", className)}
			{...props}
		>
			{children}
		</h1>
	);
}
