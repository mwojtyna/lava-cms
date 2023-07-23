import { router } from "@admin/src/trpc";
import { setConfig } from "./setConfig";
import { getConfig } from "./getConfig";

export const configRouter = router({
	setConfig,
	getConfig,
});
