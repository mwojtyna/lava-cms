import { router } from "@admin/src/trpc";
import { getConfig } from "./getConfig";
import { getPage } from "./getPage";

export const publicRouter = router({
	getConfig,
	getPage,
});

export const publicCaller = publicRouter.createCaller({});

export type PublicRouter = typeof publicRouter;
