"use client";

import * as React from "react";
import Link from "next/link";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@admin/src/components/ui/client";
import { cn } from "@admin/src/utils/styling";
import { type NavMenuRoute, getRoute } from "@admin/src/data/routes/navMenu";
import { usePathname } from "@admin/src/hooks";
import { useMenuStore } from "@admin/src/data/stores/dashboard";

export function NavMenuItem({ route, small }: { route: NavMenuRoute; small?: boolean }) {
	const matchedRoute = getRoute(usePathname());
	const menu = useMenuStore();

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Link href={route.path} tabIndex={-1}>
					<Button
						// Wait for the button to highlight before navigating (better UX)
						onClick={() => setTimeout(() => menu.set(false))}
						className={cn(
							"w-full justify-start",
							small && "p-3",
							route.path === matchedRoute?.path && "bg-accent"
						)}
						variant={"ghost"}
						size="lg"
						icon={route.icon}
						aria-label={route.label}
					>
						<span className={cn(small && "hidden")}>{route.label}</span>
					</Button>
				</Link>
			</TooltipTrigger>

			{small && <TooltipContent>{route.label}</TooltipContent>}
		</Tooltip>
	);
}