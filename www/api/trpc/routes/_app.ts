import { router } from "@api/trpc/trpc";
import { authRouter } from "./auth/_auth";

export const appRouter = router({
	auth: authRouter,
});
export const caller = appRouter.createCaller({});

export type AppRouter = typeof appRouter;
