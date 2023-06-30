import { publicProcedure } from "@admin/src/trpc";
import { z } from "zod";
import { auth } from "@admin/src/auth";

export const signUp = publicProcedure
	.input(
		z.object({
			name: z.string(),
			lastName: z.string(),
			email: z.string().email(),
			password: z.string().min(8).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/),
		})
	)
	.mutation(async ({ input, ctx }) => {
		const user = await auth.createUser({
			primaryKey: {
				providerId: "email",
				providerUserId: input.email,
				password: input.password,
			},
			attributes: {
				email: input.email,
				name: input.name,
				last_name: input.lastName,
			} satisfies Lucia.UserAttributes,
		});
		const session = await auth.createSession(user.id);
		ctx.authReq.setSession(session);
	});
