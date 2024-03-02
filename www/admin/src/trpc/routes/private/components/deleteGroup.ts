import { z } from "zod";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";

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
