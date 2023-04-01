import { trpc } from "@admin/src/utils/trpc";
import WebsiteSettings from "./(components)/WebsiteSettings";

export const revalidate = 0;

export default async function Settings() {
	const websiteSettings = await trpc.config.getConfig.query();

	return (
		<>
			<WebsiteSettings initialData={websiteSettings} />
		</>
	);
}
