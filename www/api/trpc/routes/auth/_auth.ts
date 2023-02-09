import { router } from "@api/trpc";
import { greeting } from "../greeting";
import { firstTime } from "./firstTime";
import { signUp } from "./signUp";
import { signIn } from "./signIn";

export const authRouter = router({
	// TODO: Remove this when implementing admin dashboard
	greeting,

	firstTime,
	signUp,
	/**
	 * @returns The user's ID
	 */
	signIn,
});

export type AuthRouter = typeof authRouter;
