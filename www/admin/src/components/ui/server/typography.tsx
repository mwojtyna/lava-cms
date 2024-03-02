import * as React from "react";
import { cn } from "@/src/utils/styling";

interface TypographyH1Props extends React.ComponentPropsWithoutRef<"h1"> {
	gradient?: boolean;
}
export function TypographyH1({ className, children, gradient, ...props }: TypographyH1Props) {
	return (
		<h1
			className={cn(
				"scroll-m-20 font-heading text-5xl tracking-tight",
				gradient &&
					"bg-gradient-to-b from-foreground/70 to-foreground bg-clip-text text-transparent dark:bg-gradient-to-t",
				className
			)}
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

export const TypographyMuted = React.forwardRef<
	HTMLParagraphElement,
	React.ComponentPropsWithoutRef<"p">
>(({ className, children, ...props }, ref) => {
	return (
		<p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props}>
			{children}
		</p>
	);
});
TypographyMuted.displayName = "TypographyMuted";

export const TypographyList = React.forwardRef<
	HTMLUListElement,
	React.ComponentPropsWithoutRef<"ul"> & { items: string[] }
>(({ className, children, items, ...props }, ref) => {
	return (
		<ul ref={ref} className={cn("ml-6 list-disc [&>li]:mt-2", className)} {...props}>
			{items.map((item, i) => (
				<li key={i}>{item}</li>
			))}
		</ul>
	);
});
TypographyList.displayName = "TypographyList";
