"use client";

import * as React from "react";
import Link from "next/link";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@admin/src/components/ui/client";
import { cn } from "@admin/src/utils/styling";
import type { Route } from "@admin/src/data/menuRoutes";
import { usePathname } from "@admin/src/hooks";

export function NavMenuItem({ route, small }: { route: Route; small?: boolean }) {
	const pathname = usePathname();

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Link href={route.path} tabIndex={-1}>
					<Button
						className={cn(
							"w-full justify-start",
							small && "p-3",
							route.path === pathname && "bg-accent"
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
