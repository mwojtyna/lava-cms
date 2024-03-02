import type { Page } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";

export const getGroup = privateProcedure
	.input(z.object({ id: z.string().cuid() }).nullish())
	.query(async ({ input }): Promise<Page> => {
		// Get root group if no input is provided
		if (!input) {
			return prisma.page.findFirstOrThrow({
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
