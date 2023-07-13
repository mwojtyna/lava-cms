import { settingsRoutes } from "@admin/src/data/routes/settings";
import { SettingsMenu } from "./SettingsMenu";

export const dynamic = "force-dynamic";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-4 !p-0 lg:flex-row lg:gap-6">
			<SettingsMenu routes={settingsRoutes} />
			{children}
		</div>
	);
}
