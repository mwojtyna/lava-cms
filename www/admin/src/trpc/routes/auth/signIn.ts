import { auth } from "@admin/src/auth";
import { publicProcedure } from "@admin/src/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const signIn = publicProcedure
	.input(
		z.object({
			email: z.string().email(),
			password: z.string(),
		})
	)
	.mutation(async ({ input, ctx }) => {
		try {
			const key = await auth.useKey("email", input.email, input.password);
			const session = await auth.createSession(key.userId);
			ctx.authReq.setSession(session);
		} catch (error) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}
	});
