import { publicProcedure } from "@api/trpc/trpc";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcrypt";
import { SignInError } from "@api/prisma/types";

const prisma = new PrismaClient();

interface SignInResponse {
	email?: string;
	password?: string;
	error?: SignInError;
}

export const signIn = publicProcedure
	.input(
		z.object({
			email: z.string(),
			password: z.string()
		})
	)
	.mutation(async ({ input }): Promise<SignInResponse> => {
		const user = await prisma.users.findFirst({
			where: {
				email: {
					equals: input.email
				}
			}
		});
		// Compare even if user is null to prevent timing attacks
		const passwordsMatch = await bcrypt.compare(input.password, user?.password ?? "");

		if (user !== null && passwordsMatch) {
			return {
				email: user.email,
				password: user.password
			};
		} else if (!user) {
			return { error: "email" };
		} else if (!passwordsMatch) {
			return { error: "password" };
		} else {
			return { error: "unknown" };
		}
	});
