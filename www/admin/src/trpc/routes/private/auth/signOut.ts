import { auth } from "@/src/auth";
import { privateProcedure } from "@/src/trpc";

export const signOut = privateProcedure.mutation(async ({ ctx }) => {
	await auth.invalidateSession(ctx.session!.sessionId);
	ctx.setSession(null);
});
