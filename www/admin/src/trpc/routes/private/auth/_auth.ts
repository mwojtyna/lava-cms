import { router } from "@admin/src/trpc";
import { generateToken } from "./generateToken";
import { setupRequired } from "./setupRequired";
import { signIn } from "./signIn";
import { signOut } from "./signOut";
import { signUp } from "./signUp";

export const authRouter = router({
	generateToken,
	setupRequired,
	signIn,
	signOut,
	signUp,
});

export type AuthRouter = typeof authRouter;
