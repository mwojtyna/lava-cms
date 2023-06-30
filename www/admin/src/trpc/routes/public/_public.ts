import { router } from "@admin/src/trpc";
import { getConfig } from "./getConfig";
import { getPage } from "./getPage";

export const publicRouter = router({
	getConfig,
	getPage,
});

// @ts-expect-error lucia-auth context requires Request API, which is not available when using caller.
// Don't use caller to run auth related queries.
export const publicCaller = publicRouter.createCaller({});

export type PublicRouter = typeof publicRouter;
