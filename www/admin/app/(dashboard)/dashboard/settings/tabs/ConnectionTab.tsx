import { caller } from "@admin/src/trpc/routes/private/_private";
import { ConnectionForm } from "./ConnectionForm";

export async function ConnectionTab() {
	const token = await caller.auth.getToken();
	const connectionSettings = await caller.settings.getConnectionSettings();

	return <ConnectionForm token={token ?? ""} connectionSettings={connectionSettings} />;
}
