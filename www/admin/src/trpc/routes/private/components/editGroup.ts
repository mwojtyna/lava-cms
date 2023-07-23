import { prisma } from "@admin/prisma/client";
import { privateProcedure } from "@admin/src/trpc";
import { z } from "zod";

export const editGroup = privateProcedure
	.input(
		z.object({
			id: z.string().cuid(),
			newName: z.string().optional(),
			newGroupId: z.string().cuid().optional(),
		}),
	)
	.mutation(async ({ input }) => {
		await prisma.componentDefinitionGroup.update({
			where: { id: input.id },
			data: {
				name: input.newName,
				parent_group_id: input.newGroupId,
			},
		});
	});
