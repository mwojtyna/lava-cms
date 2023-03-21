import { router } from "@api/trpc";
import { setupRequired } from "./setupRequired";
import { signUp } from "./signUp";
import { signIn } from "./signIn";
import { getUser } from "./getUser";

export const authRouter = router({
	setupRequired,
	signUp,
	/**
	 * @returns The user's ID
	 */
	signIn,
	getUser,
});

export type AuthRouter = typeof authRouter;
