import type { Page } from "@prisma/client";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@admin/prisma/client";
import { privateProcedure } from "@admin/src/trpc";

export const getGroup = privateProcedure
	.input(z.object({ id: z.string().cuid() }).nullish())
	.query(async ({ input }): Promise<Page | null> => {
		// Get root group if no input is provided
		if (!input) {
			return prisma.page.findFirst({
				where: {
					parent_id: null,
				},
			});
		}

		const group = await prisma.page.findFirst({
			where: {
				id: input.id,
				is_group: true,
			},
		});
		if (!group) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}

		return group;
	});
