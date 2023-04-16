import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";
import { caller } from "../_app";

export const movePage = publicProcedure
	.input(
		z.object({
			id: z.string().cuid(),
			slug: z.string(),
			newParentId: z.string().cuid(),
		})
	)
	.mutation(async ({ input }) => {
		const [page, parentPage] = await prisma.$transaction([
			prisma.page.findFirst({
				where: { id: input.id },
			}),
			prisma.page.findFirst({
				where: { id: input.newParentId },
			}),
		]);

		if (!page || !parentPage) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}

		await prisma.$transaction(async (tx) => {
			await caller.pages.editPage({
				id: input.id,
				newName: page.name,
				newUrl: parentPage.url + (parentPage.url === "/" ? "" : "/") + input.slug,
			});

			const newParentChildCount = await tx.page.findMany({
				where: { parent_id: input.newParentId },
				select: { _count: true },
			});
			await tx.page.update({
				where: { id: input.id },
				data: {
					parent_id: input.newParentId,
					order: newParentChildCount.length,
				},
			});
			await tx.page.updateMany({
				where: {
					parent_id: page.parent_id,
					order: {
						gt: page.order,
					},
				},
				data: {
					order: {
						decrement: 1,
					},
				},
			});
		});
	});
