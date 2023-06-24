import { publicProcedure } from "@admin/src/trpc";
import { z } from "zod";
import { prisma } from "@admin/prisma/client";
import type { User } from "@admin/prisma/types";

export const getUser = publicProcedure
	.input(
		z.object({
			id: z.string().cuid(),
		})
	)
	.query(async ({ input }): Promise<{ user: Omit<User, "password"> | null }> => {
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
