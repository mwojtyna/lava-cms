import { auth } from "@admin/src/auth";
import { privateProcedure } from "@admin/src/trpc";

export const signOut = privateProcedure.mutation(async ({ ctx }) => {
	await auth.invalidateSession(ctx.session!.sessionId);
	ctx.setSession(null);
});
