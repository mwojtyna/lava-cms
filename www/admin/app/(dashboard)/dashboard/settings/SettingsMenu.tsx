"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/src/components/ui/client/Button";
import type { SettingsRoute } from "@/src/routes/settings";
import { getRoute } from "@/src/routes/shared";
import { cn } from "@/src/utils/styling";

export function SettingsMenu({ routes }: { routes: SettingsRoute[] }) {
	const matchedRoute = getRoute(usePathname(), routes);

	return (
		<div className="flex w-fit gap-2 overflow-x-auto overflow-y-hidden lg:flex-col">
			{routes.map((route) => (
				<Link key={route.path} href={route.path} className="w-full" tabIndex={-1}>
					<Button
						className={cn(
							route.path === matchedRoute?.path && "bg-accent",
							"w-full justify-start whitespace-nowrap",
						)}
						variant={"ghost"}
						icon={route.icon}
					>
						{route.label}
					</Button>
				</Link>
			))}
		</div>
	);
}
