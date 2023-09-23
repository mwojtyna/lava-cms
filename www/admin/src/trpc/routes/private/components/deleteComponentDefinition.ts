import { z } from "zod";
import { privateProcedure } from "@admin/src/trpc";
import { prisma } from "@admin/prisma/client";

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
