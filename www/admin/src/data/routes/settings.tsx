import Settings from "@admin/app/dashboard/settings/page";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import type { Route } from "./common";
import "server-only";

export interface SettingsRoute extends Route {
	content: React.ReactNode;
}

export const settingsRoutes: SettingsRoute[] = [
	{
		label: "SEO",
		path: "",
		icon: <MagnifyingGlassIcon className="w-4" />,
		content: <Settings />,
	},
	{
		label: "Other",
		path: "other",
		content: <div>other</div>,
	},
];
