import { z } from "zod";
import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";

export const deletePage = publicProcedure
	.input(
		z.object({
			id: z.string().cuid(),
			parent_id: z.string().cuid(),
			order: z.number().int(),
		})
	)
	.mutation(async ({ input }) => {
		prisma.$transaction([
			prisma.page.delete({
				where: { id: input.id },
			}),
			prisma.page.updateMany({
				where: {
					parent_id: input.parent_id,
					order: {
						gt: input.order,
					},
				},
				data: {
					order: {
						decrement: 1,
					},
				},
			}),
		]);
	});
