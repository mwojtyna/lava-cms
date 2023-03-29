import { router } from "@api/trpc";
import { setConfig } from "./setConfig";
import { getConfig } from "./getConfig";

export const configRouter = router({
	setConfig,
	getConfig,
});

export type ConfigRouter = typeof configRouter;
