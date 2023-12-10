"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/src/components/ui/client";
import type { SettingsRoute } from "@/src/data/routes/settings";
import { cn } from "@/src/utils/styling";

export function SettingsMenu({ routes }: { routes: SettingsRoute[] }) {
	const segments = usePathname().split("/");
	const lastSegment = segments[segments.length - 1];

	return (
		<div className="flex w-fit gap-2 overflow-x-auto overflow-y-hidden lg:flex-col">
			{routes.map((route, i) => (
				<Link
					key={i}
					href={"/dashboard/settings/" + route.path}
					className="w-full"
					tabIndex={-1}
				>
					<Button
						className={cn(
							(lastSegment === route.path ||
								(lastSegment === "settings" && route.path === "")) &&
								"bg-accent",
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
