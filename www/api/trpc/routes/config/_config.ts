import { router } from "@api/trpc";
import { setConfig } from "./setConfig";

export const configRouter = router({
	setConfig,
});

export type ConfigRouter = typeof configRouter;
