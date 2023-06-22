import Settings from "@admin/app/dashboard/settings/page";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";

interface SettingsRoute {
	label: string;
	slug: string;
	icon?: React.ReactNode;
	content: (() => Promise<React.ReactNode>) | React.ReactNode | Promise<React.ReactNode>;
}

export const routes: SettingsRoute[] = [
	{
		label: "SEO",
		slug: "",
		icon: <MagnifyingGlassIcon className="w-4" />,
		content: <Settings />,
	},
	{
		label: "Other",
		slug: "other",
		content: <div>other</div>,
	},
];
