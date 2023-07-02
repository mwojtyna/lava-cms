import { caller } from "@admin/src/trpc/routes/private/_private";
import { SeoForm } from "./SeoForm";

export default async function Settings() {
	const serverData = await caller.config.getConfig();
	return <SeoForm serverData={serverData} />;
}
