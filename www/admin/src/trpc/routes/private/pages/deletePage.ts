import { z } from "zod";
import { prisma } from "@admin/prisma/client";
import { privateProcedure } from "@admin/src/trpc";

export const deletePage = privateProcedure
	.input(
		z.object({
			id: z.string().cuid(),
		})
	)
	.mutation(async ({ input }) => {
		// This deletes the page and also all of its children
		// thanks to the `Cascade` setting in the Prisma schema
		await prisma.page.delete({
			where: {
				id: input.id,
			},
		});
	});
