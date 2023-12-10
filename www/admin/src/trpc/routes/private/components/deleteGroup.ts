import { z } from "zod";
import { prisma } from "@admin/prisma/client";
import { privateProcedure } from "@admin/src/trpc";

export const deleteGroup = privateProcedure
	.input(
		z.object({
			id: z.string().cuid(),
		}),
	)
	.mutation(async ({ input }) => {
		await prisma.componentDefinitionGroup.delete({
			where: {
				id: input.id,
			},
		});
	});
