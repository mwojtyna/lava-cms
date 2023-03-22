import { HomeIcon, Cog6ToothIcon } from "@heroicons/react/24/solid";

interface Route {
	label: string;
	path: string;
	icon?: React.ReactNode;
	startingRoute?: boolean;
}

export const menuRoutes: Route[] = [
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
