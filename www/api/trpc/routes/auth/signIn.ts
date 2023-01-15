import { publicProcedure } from "@api/trpc/trpc";
import { z } from "zod";
import bcrypt from "bcrypt";
import { SignInError } from "@api/prisma/types";
import { prisma } from "@api/prisma/client";

interface SignInResponse {
	user?: {
		id: number;
		email: string;
		password: string;
	};
	error?: SignInError;
}

export const signIn = publicProcedure
	.input(
		z.object({
			email: z.string(),
			password: z.string(),
		})
	)
	.mutation(async ({ input }): Promise<SignInResponse> => {
		const user = await prisma.users.findFirst({
			where: {
				email: {
					equals: input.email,
				},
			},
		});
		// Compare even if user is null to prevent timing attacks
		const passwordsMatch = await bcrypt.compare(input.password, user?.password ?? "");

		if (user !== null && passwordsMatch) {
			return {
				user: {
					id: user.id,
					email: user.email,
					password: user.password,
				},
			};
		} else if (!user) {
			return { error: "email" };
		} else if (!passwordsMatch) {
			return { error: "password" };
		} else {
			return { error: "unknown" };
		}
	});
