import { caller } from "@admin/src/trpc/routes/private/_private";
import { SeoForm } from "./SeoForm";

export async function SeoTab() {
	const serverData = await caller.config.getConfig();
	return <SeoForm serverData={serverData} />;
}
