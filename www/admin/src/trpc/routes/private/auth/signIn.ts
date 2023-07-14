import { auth } from "@admin/src/auth";
import { privateProcedure } from "@admin/src/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const signIn = privateProcedure
	.meta({ noAuth: true })
	.input(
		z.object({
			email: z.string().email(),
			password: z.string(),
		})
	)
	.mutation(async ({ input, ctx }) => {
		try {
			const key = await auth.useKey("email", input.email, input.password);
			const session = await auth.createSession({ userId: key.userId, attributes: {} });
			ctx.setSession(session);
			await auth.deleteDeadUserSessions(key.userId);
		} catch (error) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}
	});
