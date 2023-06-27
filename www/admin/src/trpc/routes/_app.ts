import { router } from "@admin/src/trpc";
import { authRouter } from "./auth/_auth";
import { configRouter } from "./config/_config";
import { pagesRouter } from "./pages/_pages";

export const appRouter = router({
	auth: authRouter,
	config: configRouter,
	pages: pagesRouter,
});

// @ts-expect-error lucia-auth context requires Request API, which is not available when using caller.
// Don't use caller to run auth related queries.
export const caller = appRouter.createCaller({});

export type AppRouter = typeof appRouter;
