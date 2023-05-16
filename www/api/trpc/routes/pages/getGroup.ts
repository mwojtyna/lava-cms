import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";
import { z } from "zod";

export const getGroup = publicProcedure
	.input(z.object({ id: z.string() }).nullish())
	.query(async ({ input }) => {
		if (!input) {
			return prisma.page.findMany({ where: { is_group: true } });
		}

		return prisma.page.findFirst({ where: { id: input.id, is_group: true } });
	});
