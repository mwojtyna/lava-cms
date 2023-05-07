import type { Route as NextRoute } from "next";
import {
	HomeIcon,
	Cog6ToothIcon,
	Square2StackIcon,
	RectangleGroupIcon,
	CircleStackIcon,
} from "@heroicons/react/24/outline";

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
		label: "Dashboard",
		path: "/dashboard",
		icon: <HomeIcon className="w-5" />,
		startingRoute: true,
	},
	{
		label: "Pages",
		path: "/dashboard/pages",
		icon: <Square2StackIcon className="w-5" />,
	},
	{
		label: "Layouts",
		path: "/dashboard/layouts" as NextRoute,
		icon: <RectangleGroupIcon className="w-5" />,
	},
	{
		label: "Content",
		path: "/dashboard/content" as NextRoute,
		icon: <CircleStackIcon className="w-5" />,
	},
	{
		label: "Settings",
		path: "/dashboard/settings",
		icon: <Cog6ToothIcon className="w-5" />,
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
