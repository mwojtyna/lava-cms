import * as React from "react";
import Link from "next/link";
import { Poppins } from "next/font/google";
import {
	ActionIcon,
	Separator,
	Sheet,
	SheetContent,
	SheetTrigger,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@admin/src/components/ui/client";
import { IconArrowBarRight, IconVolcano } from "@tabler/icons-react";
import { TypographyH1, TypographyMuted } from "@admin/src/components/ui/server";
import { routes } from "@admin/src/data/menuRoutes";
import { cn } from "@admin/src/utils/styling";
import { UserMenu } from "./UserMenu";
import { NavMenuItem } from "./NavMenuItem";

const logoFont = Poppins({
	weight: ["600"],
	subsets: ["latin"],
});

interface MenuProps extends React.ComponentPropsWithRef<"nav"> {
	responsive?: boolean;
}
async function Menu({ className, responsive = true, ...props }: MenuProps) {
	const version = (await import("@admin/../package.json")).version;

	return (
		<nav
			className={cn(
				"flex h-full w-[275px] flex-col overflow-auto border-r border-r-border p-6 py-8",
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
				aria-label="Logo link"
			>
				<IconVolcano size={56} aria-label="Logo image" />
				<TypographyH1 className={cn("relative select-none text-4xl", logoFont.className)}>
					Lava
					<TypographyMuted className="absolute -right-5 -top-[3px] rotate-[20deg] font-sans text-xs font-bold tracking-normal">
						v{version}
					</TypographyMuted>
				</TypographyH1>
			</Link>

			{responsive && (
				<div className="mb-4 w-fit space-y-4 sm:hidden">
					<Tooltip>
						<TooltipTrigger asChild>
							<SheetTrigger asChild>
								<ActionIcon
									variant={"outline"}
									className="p-3"
									aria-label="Expand menu"
								>
									<IconArrowBarRight size={20} />
								</ActionIcon>
							</SheetTrigger>
						</TooltipTrigger>

						<TooltipContent>Expand menu</TooltipContent>
					</Tooltip>

					<Separator />
				</div>
			)}

			<div className="flex flex-grow flex-col justify-between gap-8">
				<div className="flex flex-col gap-2">
					{routes.map((route, i) => (
						<React.Fragment key={i}>
							{i === 1 && (
								<Separator className={cn(responsive && "hidden sm:block")} />
							)}

							<NavMenuItem route={route} responsive={responsive} />

							{i === 3 && (
								<Separator className={cn(responsive && "hidden sm:block")} />
							)}
						</React.Fragment>
					))}
				</div>

				{/* @ts-expect-error Async Server Component */}
				<UserMenu responsive={responsive} />
			</div>
		</nav>
	);
}

export function NavMenu() {
	return (
		<Sheet>
			{/* @ts-expect-error Async Server Component */}
			<Menu />

			<SheetContent
				position={"left"}
				size={"content"}
				className="h-full p-0"
				maxScreenWidth={640}
			>
				{/* @ts-expect-error Async Server Component */}
				<Menu className="w-screen" responsive={false} />
			</SheetContent>
		</Sheet>
	);
}
