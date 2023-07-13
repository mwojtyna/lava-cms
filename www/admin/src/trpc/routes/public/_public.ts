import { router } from "@admin/src/trpc";
import { getConfig } from "./getConfig";
import { getPage } from "./getPage";
import { getPaths } from "./getPaths";

export const publicRouter = router({
	getConfig,
	getPage,
	getPaths,
});

export const publicCaller = publicRouter.createCaller({});

export type PublicRouter = typeof publicRouter;
