import { router } from "@admin/src/trpc";
import { generateToken } from "./generateToken";
import { getToken } from "./getToken";
import { setupRequired } from "./setupRequired";
import { signIn } from "./signIn";
import { signOut } from "./signOut";
import { signUp } from "./signUp";

export const authRouter = router({
	getToken,
	generateToken,
	setupRequired,
	signIn,
	signOut,
	signUp,
});
