import { prisma } from "@admin/prisma/client";
import { privateProcedure } from "@admin/src/trpc";
import { z } from "zod";

export const getPageComponents = privateProcedure
	.input(
		z.object({
			id: z.string().cuid(),
		}),
	)
	.query(async ({ input }) => {
		const page = await prisma.page.findFirstOrThrow({
			where: {
				id: input.id,
			},
			include: {
				components: {
					include: {
						fields: {
							include: {
								definition: true,
							},
						},
						definition: true,
					},
					orderBy: {
						order: "asc",
					},
				},
			},
		});
		return page.components;
	});
