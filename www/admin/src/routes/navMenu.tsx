import type { Route } from "./shared";
import { HomeIcon, Cog6ToothIcon, Square2StackIcon, CubeIcon } from "@heroicons/react/24/outline";
import "server-only";

export interface NavMenuRoute extends Route {
	description: string;
}

export const navMenuRoutes: NavMenuRoute[] = [
	{
		label: "Dashboard",
		path: "/dashboard",
		description: "Lorem ipsum",
		icon: <HomeIcon className="w-5" />,
		disabled: true,
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
		description: "Create and manage your component definitions.",
		icon: <CubeIcon className="w-5" />,
		hasChildren: true,
	},
	{
		label: "Settings",
		path: "/dashboard/settings",
		description: "Manage your website and CMS settings.",
		icon: <Cog6ToothIcon className="w-5" />,
		hasChildren: true,
	},
];
