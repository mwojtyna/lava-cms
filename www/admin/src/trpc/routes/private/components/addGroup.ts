import { z } from "zod";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";
import { displayNameRegex } from "@/src/utils/regex";

export const addGroup = privateProcedure
	.input(
		z.object({
			name: z.string().regex(displayNameRegex),
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
