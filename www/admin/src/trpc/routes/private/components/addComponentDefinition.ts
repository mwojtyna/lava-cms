import { z } from "zod";
import { privateProcedure } from "@admin/src/trpc";
import { ComponentFieldDefinitionSchema } from "@admin/prisma/generated/zod";
import { prisma } from "@admin/prisma/client";

export const addComponentDefinition = privateProcedure
	.input(
		z.object({
			name: z.string(),
			groupId: z.string().cuid(),
			fields: z.array(ComponentFieldDefinitionSchema.pick({ name: true, type: true })),
		}),
	)
	.mutation(async ({ input }) => {
		const { id: componentDefinitionId } = await prisma.componentDefinition.create({
			data: {
				name: input.name,
				group_id: input.groupId,
			},
		});

		await prisma.componentFieldDefinition.createMany({
			data: input.fields.map((field) => ({
				name: field.name,
				type: field.type,
				component_definition_id: componentDefinitionId,
			})),
		});
	});
