import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { HomeIcon } from "@heroicons/react/24/solid";

interface Route {
	label: string;
	path: string;
	icon?: React.ReactNode;
	children?: Route[];
}
export const routes: Route[] = [
	{
		label: "Dashboard",
		path: "/dashboard",
		icon: <HomeIcon className="w-5" />,
	},
	{
		label: "Settings",
		path: "/settings",
		icon: <Cog6ToothIcon className="w-5" />,
	},
];
