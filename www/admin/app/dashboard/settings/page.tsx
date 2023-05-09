import { trpc } from "@admin/src/utils/trpc";
import { WebsiteSettingsForm } from "./WebsiteSettingsForm";

export const dynamic = "force-dynamic";

export default async function Settings() {
	const initialData = await trpc.config.getConfig.query();

	// TODO: Move mobile NavMenu to a top bar
	// TODO: Add a menu for future settings pages
	return (
		<>
			<WebsiteSettingsForm initialData={initialData} />
		</>
	);
}
