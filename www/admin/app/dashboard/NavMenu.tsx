import * as React from "react";
import Link from "next/link";
import { Poppins } from "next/font/google";
import {
	ActionIcon,
	Button,
	Separator,
	Sheet,
	SheetContent,
	SheetTrigger,
} from "@admin/src/components/ui/client";
import { IconArrowBarRight, IconVolcano } from "@tabler/icons-react";
import { TypographyH1 } from "@admin/src/components/ui/server";
import { routes } from "@admin/src/data/menuRoutes";
import { getPathname } from "@admin/src/utils/server";
import { cn } from "@admin/src/utils/styling";

const logoFont = Poppins({
	weight: ["600"],
	subsets: ["latin"],
});

interface MenuProps extends React.ComponentPropsWithRef<"nav"> {
	version: string;
	responsive?: boolean;
}
const Menu = ({ className, version, responsive = true, ...props }: MenuProps) => (
	<nav
		className={cn(
			"w-[275px] overflow-auto border-r border-r-border p-6 py-8",
			responsive && "w-fit p-3 py-4 sm:w-[275px] sm:p-6 sm:py-8",
			className
		)}
		{...props}
	>
		<Link
			href="/dashboard"
			className={cn(
				"mb-8 flex items-center justify-center gap-2",
				responsive && "hidden sm:flex"
			)}
		>
			<IconVolcano size={56} />
			<TypographyH1 className={cn("relative select-none text-4xl", logoFont.className)}>
				Lava
				<p className="absolute -right-5 -top-[3px] rotate-[20deg] font-sans text-xs font-bold tracking-normal text-muted-foreground">
					v{version}
				</p>
			</TypographyH1>
		</Link>

		{responsive && (
			<div className="mb-4 w-fit space-y-4 sm:hidden">
				<SheetTrigger asChild>
					<ActionIcon variant={"outline"} className="rounded-md p-3">
						<IconArrowBarRight size={20} />
					</ActionIcon>
				</SheetTrigger>
				<Separator />
			</div>
		)}

		<div className="flex flex-col gap-2">
			{routes.map((route, i) => (
				<React.Fragment key={i}>
					{i === 1 && <Separator className={cn(responsive && "hidden sm:block")} />}
					<Link href={route.path} tabIndex={-1}>
						<Button
							className={cn(
								"w-full justify-start",
								responsive && "w-fit p-3 sm:w-full sm:p-4",
								route.path === getPathname() && "bg-accent"
							)}
							variant={"ghost"}
							icon={route.icon}
						>
							<span className={cn(responsive && "hidden sm:block")}>
								{route.label}
							</span>
						</Button>
					</Link>
					{i === 3 && <Separator className={cn(responsive && "hidden sm:block")} />}
				</React.Fragment>
			))}
		</div>
	</nav>
);

export async function NavMenu() {
	const version = (await import("@admin/../package.json")).version;

	return (
		<Sheet>
			<Menu version={version} />

			<SheetContent position={"left"} size={"content"} className="p-0" maxScreenWidth={640}>
				<Menu className="w-screen" version={version} responsive={false} />
			</SheetContent>
		</Sheet>
	);
}
