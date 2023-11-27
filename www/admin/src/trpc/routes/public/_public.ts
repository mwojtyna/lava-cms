import { router } from "@admin/src/trpc";
import { getHead } from "./getHead";
import { getPage } from "./getPage";
import { getPaths } from "./getPaths";

export const publicRouter = router({
	getHead,
	getPage,
	getPaths,
});

export const publicCaller = publicRouter.createCaller({});

export type PublicRouter = typeof publicRouter;
