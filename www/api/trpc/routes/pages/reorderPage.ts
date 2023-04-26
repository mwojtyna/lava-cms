import { z } from "zod";
import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";

export const reorderPage = publicProcedure
	.input(
		z.object({
			activeId: z.string().cuid(),
			activeParentId: z.string().cuid(),
			overId: z.string().cuid(),
			order: z.number().int(),
			newOrder: z.number().int(),
		})
	)
	.mutation(async ({ input }) => {
		await prisma.$transaction([
			prisma.page.updateMany({
				where: {
					AND: [
						{
							parent_id: input.activeParentId,
						},
						{
							order: { gt: input.order },
						},
						{
							id: { not: input.activeId },
						},
					],
				},
				data: {
					order: { decrement: 1 },
				},
			}),
			prisma.page.update({
				where: {
					id: input.activeId,
				},
				data: {
					order: input.newOrder,
				},
			}),
			prisma.page.updateMany({
				where: {
					AND: [
						{
							parent_id: input.activeParentId,
						},
						{
							order: { gte: input.newOrder },
						},
						{
							id: { not: input.activeId },
						},
					],
				},
				data: {
					order: { increment: 1 },
				},
			}),
		]);
	});
