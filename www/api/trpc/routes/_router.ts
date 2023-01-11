import { router } from "../trpc";
import { greeting } from "./greeting";
import { firstTime } from "./auth/firstTime";
import { signUp } from "./auth/signUp";
import { signIn } from "./auth/signIn";

export const appRouter = router({
	greeting,

	// Auth
	firstTime,
	signUp,
	signIn
});

export type AppRouter = typeof appRouter;
