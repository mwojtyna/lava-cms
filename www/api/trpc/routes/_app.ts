import { router } from "@api/trpc";
import { authRouter } from "./auth/_auth";
import { configRouter } from "./config/_config";

export const appRouter = router({
	auth: authRouter,
	config: configRouter,
});
export const caller = appRouter.createCaller({});

export type AppRouter = typeof appRouter;
