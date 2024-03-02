import { z } from "zod";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";
import { displayNameRegex } from "@/src/utils/regex";

export const editGroup = privateProcedure
	.input(
		z.object({
			id: z.string().cuid(),
			newName: z.string().regex(displayNameRegex).optional(),
			newGroupId: z.string().cuid().optional(),
		}),
	)
	.mutation(async ({ input }) => {
		await prisma.componentDefinitionGroup.update({
			where: { id: input.id },
			data: {
				name: input.newName,
				parent_group_id: input.newGroupId,
				last_update: new Date(),
			},
		});
	});
