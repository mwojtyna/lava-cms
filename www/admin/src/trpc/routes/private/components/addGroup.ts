import { z } from "zod";
import { prisma } from "@admin/prisma/client";
import { privateProcedure } from "@admin/src/trpc";

export const addGroup = privateProcedure
	.input(
		z.object({
			name: z.string(),
			parentId: z.string().cuid().nullable(),
		}),
	)
	.mutation(async ({ input }) => {
		await prisma.componentDefinitionGroup.create({
			data: {
				name: input.name,
				parent_group_id: input.parentId,
			},
		});
	});
