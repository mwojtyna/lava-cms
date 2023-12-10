import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { auth } from "@/src/auth";
import { privateProcedure } from "@/src/trpc";

export const signIn = privateProcedure
	.meta({ noAuth: true })
	.input(
		z.object({
			email: z.string().email(),
			password: z.string(),
		}),
	)
	.mutation(async ({ input, ctx }) => {
		try {
			const key = await auth.useKey("email", input.email, input.password);
			const session = await auth.createSession({
				sessionId: createId(),
				userId: key.userId,
				attributes: {},
			});
			ctx.setSession(session);
			await auth.deleteDeadUserSessions(key.userId);
		} catch (error) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}
	});
