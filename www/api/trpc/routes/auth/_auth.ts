import { router } from "@api/trpc";
import { firstTime } from "./firstTime";
import { signUp } from "./signUp";
import { signIn } from "./signIn";
import { getUser } from "./getUser";

export const authRouter = router({
	firstTime,
	signUp,
	/**
	 * @returns The user's ID
	 */
	signIn,
	getUser,
});

export type AuthRouter = typeof authRouter;
