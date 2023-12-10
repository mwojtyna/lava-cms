import { router } from "@admin/src/trpc";
import { getConnectionSettings } from "./getConnectionSettings";
import { getSeoSettings } from "./getSeoSettings";
import { setConnectionSettings } from "./setConnectionSettings";
import { setSeoSettings } from "./setSeoSettings";
import { setup } from "./setup";

export const settingsRouter = router({
	setSeoSettings,
	getSeoSettings,
	getConnectionSettings,
	setConnectionSettings,
	setup,
});
