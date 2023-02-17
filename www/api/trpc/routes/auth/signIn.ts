import { publicProcedure } from "@api/trpc";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "@api/prisma/client";

export const signIn = publicProcedure
	.input(
		z.object({
			email: z.string().email(),
			password: z.string(),
		})
	)
	.mutation(async ({ input }) => {
		const user = await prisma.user.findFirst({
			where: {
				email: {
					equals: input.email,
				},
			},
		});
		const passwordsMatch = await bcrypt.compare(input.password, user?.password ?? "");

		if (user !== null && passwordsMatch) {
			return { userId: user.id };
		} else if (!user || !passwordsMatch) {
			return null;
		}
	});
