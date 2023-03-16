import { publicProcedure } from "@api/trpc";
import { z } from "zod";
import { prisma } from "@api/prisma/client";
import type { User } from "@api/prisma/types";

export const getUser = publicProcedure
	.input(
		z.object({
			id: z.string(),
		})
	)
	.query(async ({ input }): Promise<{ user: Omit<User, User["password"]> | null }> => {
		const user = await prisma.user.findFirst({
			where: {
				id: {
					equals: input.id,
				},
			},
		});

		if (!user) {
			return { user: null };
		}

		const { password, ...safe } = user; // strip password from returned object
		return { user: safe };
	});
