import { publicProcedure } from "@api/trpc/trpc";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "@api/prisma/client";
import { TRPCError } from "@trpc/server";

export type SignInError = "email" | "password";

export const signIn = publicProcedure
	.input(
		z.object({
			email: z.string(),
			password: z.string(),
		})
	)
	.mutation(async ({ input }) => {
		const user = await prisma.users.findFirst({
			where: {
				email: {
					equals: input.email,
				},
			},
		});
		const passwordsMatch = await bcrypt.compare(input.password, user?.password ?? "");

		if (user !== null && passwordsMatch) {
			return { userId: user.id };
		} else if (!user) {
			throw new TRPCError({ code: "UNAUTHORIZED", message: "email" as SignInError });
		} else if (!passwordsMatch) {
			throw new TRPCError({ code: "UNAUTHORIZED", message: "password" as SignInError });
		} else {
			throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
		}
	});
