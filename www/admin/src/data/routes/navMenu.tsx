import {
	HomeIcon,
	Cog6ToothIcon,
	Square2StackIcon,
	CircleStackIcon,
	CubeIcon,
} from "@heroicons/react/24/outline";
import type { Route } from "./common";
import "server-only";

export interface NavMenuRoute extends Route {
	description: string;
}

export const navMenuRoutes: NavMenuRoute[] = [
	{
		label: "Dashboard",
		path: "/dashboard",
		description: "asd",
		icon: <HomeIcon className="w-5" />,
	},
	{
		label: "Pages",
		path: "/dashboard/pages",
		description: "Create and manage your pages.",
		icon: <Square2StackIcon className="w-5" />,
		hasChildren: true,
	},
	{
		label: "Components",
		path: "/dashboard/components",
		description: "",
		icon: <CubeIcon className="w-5" />,
	},
	{
		label: "Data",
		path: "/dashboard/data",
		description: "data",
		icon: <CircleStackIcon className="w-5" />,
	},
	{
		label: "Settings",
		path: "/dashboard/settings",
		description: "Manage your website settings.",
		icon: <Cog6ToothIcon className="w-5" />,
		hasChildren: true,
	},
];
