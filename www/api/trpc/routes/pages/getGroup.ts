import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";
import { z } from "zod";

export const getGroup = publicProcedure
	.input(z.object({ id: z.string() }))
	.query(async ({ input }) => {
		const group = await prisma.page.findFirst({
			where: {
				id: input.id,
				is_group: true,
			},
		});
		const pages = await prisma.page.findMany({ where: { parent_id: input.id } });

		return {
			group,
			pages,
		};
	});
