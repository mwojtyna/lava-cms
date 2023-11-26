import { router } from "@admin/src/trpc";
import { setSeoSettings } from "./setSeoSettings";
import { getSeoSettings } from "./getSeoSettings";
import { getConnectionSettings } from "./getConnectionSettings";
import { setConnectionSettings } from "./setConnectionSettings";
import { setup } from "./setup";

export const settingsRouter = router({
	setSeoSettings,
	getSeoSettings,
	getConnectionSettings,
	setConnectionSettings,
	setup,
});
