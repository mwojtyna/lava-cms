import { trpc } from "@admin/src/utils/trpc";
import WebsiteSettings from "./_components/WebsiteSettings";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Lava CMS - Settings",
};
export const revalidate = 0;

export default async function Settings() {
	const websiteSettings = await trpc.config.getConfig.query();

	return (
		<>
			<WebsiteSettings initialData={websiteSettings} />
		</>
	);
}
