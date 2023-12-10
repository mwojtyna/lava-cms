import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";
import { caller } from "../_private";

export const movePage = privateProcedure
	.input(
		z.object({
			id: z.string().cuid(),
			newParentId: z.string().cuid(),
		}),
	)
	.mutation(async ({ input }) => {
		const [page, parentGroup] = await prisma.$transaction([
			prisma.page.findUnique({
				where: { id: input.id },
			}),
			prisma.page.findUnique({
				where: { id: input.newParentId },
			}),
		]);

		if (!page || !parentGroup) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}

		await caller.pages.editPage({
			id: input.id,
			newName: page.name,
			newUrl: parentGroup.url + "/" + page.url.split("/").pop()!,
		});
		await prisma.page.update({
			where: { id: input.id },
			data: {
				parent_id: input.newParentId,
			},
		});
	});
