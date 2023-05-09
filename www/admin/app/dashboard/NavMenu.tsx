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
import { IconVolcano } from "@tabler/icons-react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@admin/tailwind.config";
import { TypographyH1, TypographyMuted } from "@admin/src/components/ui/server";
import { routes } from "@admin/src/data/menuRoutes";
import { cn } from "@admin/src/utils/styling";
import { UserMenu } from "./UserMenu";
import { NavMenuItem } from "./NavMenuItem";

const logoFont = Poppins({
	weight: ["600"],
	subsets: ["latin"],
});

async function Menu({ className }: { className?: string }) {
	const version = (await import("@admin/../package.json")).version;

	return (
		<nav
			className={cn(
				"flex flex-col overflow-auto border-r border-r-border p-6 py-8",
				className
			)}
		>
			<Link
				href="/dashboard"
				className="mb-8 flex items-center justify-center gap-2"
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

			<div className="flex flex-grow flex-col justify-between gap-8">
				<div className="flex flex-col gap-2">
					{routes.map((route, i) => (
						<React.Fragment key={i}>
							{i === 1 && <Separator />}

							<NavMenuItem route={route} />

							{i === 3 && <Separator />}
						</React.Fragment>
					))}
				</div>

				{/* @ts-expect-error Async Server Component */}
				<UserMenu />
			</div>
		</nav>
	);
}

function MenuMobile({ className }: { className?: string }) {
	return (
		<nav
			className={cn(
				"flex flex-grow items-center justify-between overflow-auto border-b border-b-border p-3",
				className
			)}
		>
			<Tooltip>
				<TooltipTrigger className="mr-4 flex w-fit gap-4" asChild>
					<SheetTrigger asChild>
						<ActionIcon variant={"ghost"} className="p-3" aria-label="Expand menu">
							<Bars3Icon className="w-5 scale-[120%]" />
						</ActionIcon>
					</SheetTrigger>
				</TooltipTrigger>

				<TooltipContent>Expand menu</TooltipContent>
			</Tooltip>

			<div className="flex gap-0.5">
				{routes.map((route, i) => (
					<NavMenuItem key={i} route={route} small={true} />
				))}
			</div>

			{/* @ts-expect-error Async Server Component */}
			<UserMenu small={true} />
		</nav>
	);
}

export function NavMenu() {
	const config = resolveConfig(tailwindConfig);

	return (
		<Sheet>
			{/* @ts-expect-error Async Server Component */}
			<Menu className="hidden h-screen sm:flex" />
			<MenuMobile className="sm:hidden" />

			<SheetContent
				position={"left"}
				size={"content"}
				className="h-full w-full p-0"
				// @ts-expect-error Tailwind config types are trash
				maxScreenWidth={config.theme.screens.sm ?? 9999}
			>
				{/* @ts-expect-error Async Server Component */}
				<Menu className="h-full" />
			</SheetContent>
		</Sheet>
	);
}
