import { z } from "zod";
import { prisma } from "@admin/prisma/client";
import { privateProcedure } from "@admin/src/trpc";

export const deleteComponentDefinition = privateProcedure
	.input(
		z.object({
			id: z.string().cuid(),
		}),
	)
	.mutation(async ({ input }) => {
		await prisma.componentDefinition.delete({
			where: {
				id: input.id,
			},
		});
	});
