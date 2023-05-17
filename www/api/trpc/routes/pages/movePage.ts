import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";
import { caller } from "../_app";

export const movePage = publicProcedure
	.input(
		z.object({
			id: z.string().cuid(),
			newParentId: z.string().cuid(),
		})
	)
	.mutation(async ({ input }) => {
		const [page, parentGroup] = await prisma.$transaction([
			prisma.page.findFirst({
				where: { id: input.id },
			}),
			prisma.page.findFirst({
				where: { id: input.newParentId },
			}),
		]);

		if (!page || !parentGroup) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}

		await prisma.$transaction(async (tx) => {
			await caller.pages.editPage({
				id: input.id,
				newName: page.name,
				newUrl:
					parentGroup.url +
					(parentGroup.parent_id !== null ? "/" : "") +
					page.url.split("/").pop(),
			});
			await tx.page.update({
				where: { id: input.id },
				data: {
					parent_id: input.newParentId,
				},
			});
		});
	});
