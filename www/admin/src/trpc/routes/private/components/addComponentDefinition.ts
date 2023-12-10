import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/prisma/client";
import { ComponentDefinitionFieldSchema } from "@/prisma/generated/zod";
import { privateProcedure } from "@/src/trpc";

export const addComponentDefinition = privateProcedure
	.input(
		z.object({
			name: z.string(),
			groupId: z.string().cuid(),
			fields: z.array(ComponentDefinitionFieldSchema.pick({ name: true, type: true })),
		}),
	)
	.mutation(async ({ input }) => {
		const alreadyExists = await prisma.componentDefinition.findUnique({
			where: {
				name: input.name,
			},
			include: {
				group: true,
			},
		});
		if (alreadyExists) {
			throw new TRPCError({
				code: "CONFLICT",
				message: JSON.stringify({
					name: alreadyExists.group.name,
					id: alreadyExists.group_id,
				}),
			});
		}

		const { id: componentDefinitionId } = await prisma.componentDefinition.create({
			data: {
				name: input.name,
				group_id: input.groupId,
			},
		});
		await prisma.componentDefinitionField.createMany({
			data: input.fields.map((field, i) => ({
				name: field.name,
				type: field.type,
				order: i,
				component_definition_id: componentDefinitionId,
			})),
		});
	});
