import { router } from "@admin/src/trpc";
import { getToken } from "./getToken";
import { generateToken } from "./generateToken";
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
