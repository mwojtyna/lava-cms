import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";
import { fieldSchema } from "./types";

export const editComponentDefinition = privateProcedure
	.input(
		z.object({
			id: z.string().cuid(),
			newName: z.string().optional(),
			newGroupId: z.string().cuid().optional(),
			addedFields: z.array(fieldSchema.extend({ id: z.string().cuid2() })).optional(),
			editedFields: z.array(fieldSchema.extend({ id: z.string().cuid() })).optional(),
			deletedFieldIds: z.array(z.string().cuid()).optional(),
		}),
	)
	.mutation(async ({ input }): Promise<Record<string, string>> => {
		const addedCompDefIds: Record<string, string> = {};

		// If editing, not moving the component definition
		if (input.newName) {
			const alreadyExists = await prisma.componentDefinition.findUnique({
				where: {
					name: input.newName,
				},
				include: {
					group: true,
				},
			});

			// If the new name already exists, but the component definition is not the one we are editing
			if (alreadyExists && alreadyExists.id !== input.id) {
				throw new TRPCError({
					code: "CONFLICT",
					message: JSON.stringify({
						name: alreadyExists.group.name,
						id: alreadyExists.group_id,
					}),
				});
			}
		}

		await prisma.$transaction(async (tx) => {
			if (input.addedFields) {
				for (const addedField of input.addedFields) {
					const added = await tx.componentDefinitionField.create({
						data: {
							name: addedField.name,
							type: addedField.type,
							array_item_type: addedField.array_item_type,
							order: addedField.order,
							component_definition_id: input.id,
						},
					});
					addedCompDefIds[addedField.id] = added.id;
				}
			}

			await tx.componentDefinition.update({
				where: { id: input.id },
				data: {
					name: input.newName,
					group_id: input.newGroupId,
					field_definitions: {
						updateMany: input.editedFields?.map((field) => ({
							where: { id: field.id },
							data: {
								name: field.name,
								type: field.type,
								array_item_type: field.array_item_type,
								order: field.order,
							},
						})),
						deleteMany: {
							id: {
								in: input.deletedFieldIds,
							},
						},
					},
					last_update: new Date(),
				},
			});
		});

		return addedCompDefIds;
	});
