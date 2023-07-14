import { prisma } from "@admin/prisma/client";
import type { Page } from "@prisma/client";
import { privateProcedure } from "@admin/src/trpc";
import { z } from "zod";

export const getGroup = privateProcedure
	.input(z.object({ id: z.string() }).nullish())
	.query(async ({ input }): Promise<Page | null> => {
		// Get root group if no input is provided
		if (!input) {
			return prisma.page.findFirst({ where: { parent_id: null } });
		}

		return prisma.page.findFirst({ where: { id: input.id, is_group: true } });
	});
