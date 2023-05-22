import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";
import { z } from "zod";

export const getGroup = publicProcedure
	.input(z.object({ id: z.string() }).nullish())
	.query(async ({ input }) => {
		// Get root group if no input is provided
		if (!input) {
			return prisma.page.findFirst({ where: { parent_id: null } });
		}

		return prisma.page.findFirst({ where: { id: input.id, is_group: true } });
	});
