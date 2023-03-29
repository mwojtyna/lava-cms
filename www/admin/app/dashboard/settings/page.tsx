import { trpc } from "@admin/src/utils/trpc";
import Content from "../(components)/Content";
import WebsiteSettings from "./(components)/WebsiteSettings";

export default async function Settings() {
	const websiteSettings = await trpc.config.getConfig.query();

	return (
		<Content>
			<WebsiteSettings initialValue={websiteSettings} />
		</Content>
	);
}
