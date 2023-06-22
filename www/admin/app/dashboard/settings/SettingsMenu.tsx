"use client";

import Link from "next/link";
import { Button } from "@admin/src/components/ui/client";
import { routes } from "@admin/src/data/routes/settings";
import { cn } from "@admin/src/utils/styling";
import { usePathname } from "@admin/src/hooks";

export function SettingsMenu() {
	const segments = usePathname().split("/");
	const lastSegment = segments[segments.length - 1];

	return (
		<div className="flex w-fit gap-2 overflow-x-auto overflow-y-hidden lg:flex-col">
			{routes.map((route, i) => (
				<Link
					key={i}
					href={"/dashboard/settings/" + route.slug}
					className="w-full"
					tabIndex={-1}
				>
					<Button
						className={cn(
							(lastSegment === route.slug ||
								(lastSegment === "settings" && route.slug === "")) &&
								"bg-accent",
							"w-full justify-start whitespace-nowrap"
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
