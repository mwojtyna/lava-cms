import { auth } from "@admin/src/auth";
import { publicProcedure } from "@admin/src/trpc";

export const signOut = publicProcedure.mutation(async ({ ctx }) => {
	const { session } = await ctx.authReq.validateUser();
	await auth.invalidateSession(session!.sessionId);
	ctx.authReq.setSession(null);
});
