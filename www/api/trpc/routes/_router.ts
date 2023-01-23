import { router } from "../trpc";
import { greeting } from "./greeting";
import { firstTime } from "./auth/firstTime";
import { signUp } from "./auth/signUp";
import { signIn } from "./auth/signIn";

const auth = {
	firstTime,
	signUp,
	/**
	 * @returns The user's ID
	 */
	signIn,
};

export const appRouter = router({
	greeting,
	...auth,
});

export type AppRouter = typeof appRouter;
