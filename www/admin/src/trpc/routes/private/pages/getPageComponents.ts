import { z } from "zod";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";

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
