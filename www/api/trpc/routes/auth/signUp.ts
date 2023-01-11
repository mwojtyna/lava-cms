import { publicProcedure } from "../../trpc";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const signUp = publicProcedure
	.input(
		z.object({
			name: z.string(),
			lastName: z.string(),
			email: z.string(),
			password: z.string()
		})
	)
	.mutation(async ({ input }) => {
		const hashed = await bcrypt.hash(input.password, 10);

		await prisma.users.create({
			data: {
				name: input.name,
				last_name: input.lastName,
				email: input.email,
				password: hashed
			}
		});
	});
