import { LinkIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import type { Route } from "./common";
import { SeoTab } from "@admin/app/dashboard/settings/tabs/SeoTab";
import { ConnectionTab } from "@admin/app/dashboard/settings/tabs/ConnectionTab";
import "server-only";

export interface SettingsRoute extends Route {
	content: React.ReactNode;
}

export const settingsRoutes: SettingsRoute[] = [
	{
		label: "SEO",
		path: "",
		icon: <MagnifyingGlassIcon className="w-4" />,
		content: <SeoTab />,
	},
	{
		label: "Connection",
		path: "connection",
		icon: <LinkIcon className="w-4" />,
		content: <ConnectionTab />,
	},
];
