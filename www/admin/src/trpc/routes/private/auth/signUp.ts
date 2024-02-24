import cuid from "cuid";
import { z } from "zod";
import { auth } from "@/src/auth";
import { privateProcedure } from "@/src/trpc";

export const signUp = privateProcedure
	.input(
		z.object({
			name: z.string(),
			lastName: z.string(),
			email: z.string().email(),
			password: z.string().min(8).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/),
		}),
	)
	.mutation(async ({ input, ctx }) => {
		const user = await auth.createUser({
			userId: cuid(),
			key: {
				providerId: "email",
				providerUserId: input.email,
				password: input.password,
			},
			attributes: {
				email: input.email,
				name: input.name,
				last_name: input.lastName,
			},
		});
		const session = await auth.createSession({
			userId: user.userId,
			attributes: {},
		});
		ctx.setSession(session);
	});
