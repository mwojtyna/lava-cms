import { trpc } from "@admin/src/utils/trpc";
import { WebsiteSettingsForm } from "./WebsiteSettingsForm";

export default async function Settings() {
	const initialData = await trpc.config.getConfig.query();

	return (
		<>
			<WebsiteSettingsForm initialData={initialData} />
		</>
	);
}
