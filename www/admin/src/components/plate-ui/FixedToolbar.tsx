import type { ToolbarProps } from "@radix-ui/react-toolbar";
import { cn } from "@/src/utils/styling";
import { Toolbar } from "./Toolbar";

export const FixedToolbar = ({ className, ...props }: ToolbarProps) => (
	<Toolbar
		className={cn(
			"supports-backdrop-blur:bg-background/60 sticky -top-[16px] left-0 z-50 w-full justify-between overflow-x-auto rounded-t-lg border border-border bg-background/95 backdrop-blur",
			className,
		)}
		{...props}
	/>
);
