"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@admin/src/components/ui/client";
import type { NavMenuRoute } from "@admin/src/data/routes/navMenu";
import { getRoute } from "@admin/src/data/routes/shared";
import { useNavMenu } from "@admin/src/data/stores/dashboard";
import { cn } from "@admin/src/utils/styling";

interface Props {
	routes: NavMenuRoute[];
	route: NavMenuRoute;
	small?: boolean;
}
export function NavMenuItem({ routes, route, small }: Props) {
	const matchedRoute = getRoute(usePathname(), routes);
	const { setOpen } = useNavMenu();

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Link href={route.path} tabIndex={-1}>
					<Button
						// Wait for the button to highlight before navigating (better UX)
						onClick={() => setTimeout(() => setOpen(false))}
						className={cn(
							"w-full justify-start",
							small && "p-3",
							route.path === matchedRoute?.path && "bg-accent",
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
