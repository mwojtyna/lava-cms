"use client";

import * as React from "react";
import Link from "next/link";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@admin/src/components/ui/client";
import { cn } from "@admin/src/utils/styling";
import type { Route } from "@admin/src/data/menuRoutes";
import { usePathname } from "@admin/src/hooks";

export function NavMenuItem({ route, responsive }: { route: Route; responsive?: boolean }) {
	const pathname = usePathname();

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Link href={route.path} tabIndex={-1}>
					<Button
						className={cn(
							"w-full justify-start",
							responsive && "w-fit p-3 sm:w-full sm:p-4",
							route.path === pathname && "bg-accent"
						)}
						variant={"ghost"}
						icon={route.icon}
						aria-label={route.label}
					>
						<span className={cn(responsive && "hidden sm:block")}>{route.label}</span>
					</Button>
				</Link>
			</TooltipTrigger>

			{responsive && <TooltipContent className="sm:hidden">{route.label}</TooltipContent>}
		</Tooltip>
	);
}
