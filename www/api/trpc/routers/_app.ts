import { router } from "../trpc";
import { greeting } from "./greeting";
import { firstTime } from "./auth/firstTime";

export const appRouter = router({
	greeting,

	// Auth
	firstTime
});

export type AppRouter = typeof appRouter;
