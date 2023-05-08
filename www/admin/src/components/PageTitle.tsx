"use client";

import { usePathname } from "@admin/src/hooks";
import { TypographyH1, TypographyMuted } from "./ui/server";
import { getRoute } from "@admin/src/data/menuRoutes";

export function PageTitle() {
	const pathname = usePathname();
	const route = getRoute(pathname)!;

	return (
		<header className="flex flex-col gap-1">
			<TypographyH1 className="text-3xl sm:text-4xl">{route.label}</TypographyH1>
			<TypographyMuted className="text-base">{route.description}</TypographyMuted>
		</header>
	);
}
