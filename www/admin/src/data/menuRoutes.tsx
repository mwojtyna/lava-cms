import type { Route as NextRoute } from "next";
import { HomeIcon, Cog6ToothIcon, Square2StackIcon } from "@heroicons/react/24/solid";

interface Route {
	label: string;
	path: NextRoute;
	icon?: React.ReactNode;
	startingRoute?: boolean;
	children?: ChildRoute[];
}
type ChildRoute = Omit<Route, "children">;

export const routes: Route[] = [
	{
		label: "Start",
		path: "/dashboard",
		icon: <HomeIcon width="1.25rem" />,
		startingRoute: true,
	},
	{
		label: "Pages",
		path: "/dashboard/pages",
		icon: <Square2StackIcon width="1.25rem" />,
	},
	{
		label: "Settings",
		path: "/dashboard/settings",
		icon: <Cog6ToothIcon width="1.25rem" />,
	},
];

export function getRoute(path: string): Route | undefined {
	for (const route of routes) {
		if (route.path === path) return route;

		if (route.children) {
			for (const child of route.children) {
				if (child.path === path) return child;
			}
		}
	}
}
