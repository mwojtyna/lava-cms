import { NavMenuLogo } from "./NavMenuLogo";
import * as React from "react";
import { Poppins } from "next/font/google";
import {
	ActionIcon,
	Separator,
	SheetContent,
	SheetTrigger,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@admin/src/components/ui/client";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { navMenuRoutes } from "@admin/src/data/routes/navMenu";
import { cn } from "@admin/src/utils/styling";
import { UserMenu } from "@admin/src/components/UserMenu";
import { NavMenuItem } from "./NavMenuItem";
import { NavMenuWrapper } from "./NavMenuWrapper";

const logoFont = Poppins({
	weight: ["600"],
	subsets: ["latin"],
});

async function Menu({ className }: { className?: string }) {
	const version = (await import("@admin/package.json")).version;

	return (
		<nav
			className={cn(
				"flex flex-col overflow-auto border-r border-r-border p-6 py-8",
				className,
			)}
		>
			<NavMenuLogo version={version} font={logoFont} />

			<div className="flex flex-grow flex-col justify-between gap-8">
				<div className="flex flex-col gap-2">
					{navMenuRoutes.map((route, i) => (
						<React.Fragment key={i}>
							{i === 1 && <Separator />}

							<NavMenuItem routes={navMenuRoutes} route={route} />

							{i === 3 && <Separator />}
						</React.Fragment>
					))}
				</div>

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
				className,
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
				{navMenuRoutes.map((route, i) => (
					<NavMenuItem key={i} routes={navMenuRoutes} route={route} small={true} />
				))}
			</div>

			<UserMenu small />
		</nav>
	);
}

export function NavMenu() {
	return (
		<NavMenuWrapper>
			<Menu className="hidden h-screen md:flex" />
			<MenuMobile className="md:hidden" />

			<SheetContent
				side={"left"}
				className="w-full p-0 sm:w-96"
				returnFocus={false}
				breakpoint="md:hidden"
			>
				<Menu className="h-full" />
			</SheetContent>
		</NavMenuWrapper>
	);
}
