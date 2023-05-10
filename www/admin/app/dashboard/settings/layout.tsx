import { SettingsMenu } from "./SettingsMenu";

export const dynamic = "force-dynamic";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-4 md:flex-row">
			<SettingsMenu />
			{children}
		</div>
	);
}
