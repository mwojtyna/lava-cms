import { HomeIcon, Cog6ToothIcon } from "@heroicons/react/24/solid";

interface Route {
	label: string;
	path: string;
	icon?: React.ReactNode;
	children?: Route[];
	startingRoute?: boolean;
}
export const rootRoutes: Route[] = [
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
