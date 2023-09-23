import { router } from "@admin/src/trpc";
import { setConfig } from "./setConfig";
import { getConfig } from "./getConfig";
import { setup } from "./setup";

export const configRouter = router({
	setConfig,
	getConfig,
	setup,
});
