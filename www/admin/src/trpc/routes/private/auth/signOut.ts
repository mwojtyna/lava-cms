import { auth } from "@admin/src/auth";
import { privateProcedure } from "@admin/src/trpc";

export const signOut = privateProcedure.mutation(async ({ ctx }) => {
	const { session } = await ctx.authReq.validateUser();
	await auth.invalidateSession(session!.sessionId);
	ctx.authReq.setSession(null);
});
