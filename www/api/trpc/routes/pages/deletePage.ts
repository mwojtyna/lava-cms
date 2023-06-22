import { z } from "zod";
import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";

export const deletePage = publicProcedure
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
