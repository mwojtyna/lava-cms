import { publicProcedure } from "@api/trpc";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "@api/prisma/client";

export const signUp = publicProcedure
	.input(
		z.object({
			name: z.string(),
			lastName: z.string(),
			email: z.string().email(),
			password: z.string().min(8).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/),
		})
	)
	.mutation(async ({ input }) => {
		const hashed = await bcrypt.hash(input.password, 10);

		await prisma.user.create({
			data: {
				name: input.name,
				last_name: input.lastName,
				email: input.email,
				password: hashed,
			},
		});
	});
