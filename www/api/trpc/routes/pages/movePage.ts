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

		await caller.pages.editPage({
			id: input.id,
			newName: page.name,
			newUrl: parentPage.url + (parentPage.url === "/" ? "" : "/") + input.slug,
		});
		await prisma.page.update({
			where: { id: input.id },
			data: { parent_id: input.newParentId },
		});
	});
