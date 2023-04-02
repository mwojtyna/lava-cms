import { HomeIcon, Cog6ToothIcon } from "@heroicons/react/24/solid";

interface Route {
	label: string;
	path: string;
	icon?: React.ReactNode;
	startingRoute?: boolean;
	children?: ChildRoute[];
}
type ChildRoute = Omit<Route, "children">;

export const routes: Route[] = [
	{
		label: "Start",
		path: "/dashboard",
		icon: <HomeIcon className="w-5" />,
		startingRoute: true,
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
