import { prisma } from "@admin/prisma/client";
import { privateProcedure } from "@admin/src/trpc";
import { z } from "zod";

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
