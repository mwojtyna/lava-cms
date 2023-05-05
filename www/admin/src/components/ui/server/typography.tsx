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

export function TypographyCode({
	children,
	className,
	...props
}: React.ComponentPropsWithoutRef<"code">) {
	return (
		<code
			className={cn(
				"relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
				className
			)}
			{...props}
		>
			{children}
		</code>
	);
}
