import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/prisma/client";
import { getInitialValue } from "@/src/data/stores/utils";
import { privateProcedure } from "@/src/trpc";
import { fieldSchema } from "./types";

export type EditComponentDefinitionErrorMessage = {
	id: string;
	name: string;
};

export const editComponentDefinition = privateProcedure
	.input(
		z.object({
			id: z.string().cuid(),
			newName: z.string().optional(),
			newGroupId: z.string().cuid().optional(),
			addedFields: z.array(fieldSchema.extend({ id: z.string().cuid2() })).optional(),
			editedFields: z
				.array(
					fieldSchema.extend({
						id: z.string().cuid(),
						original: fieldSchema.extend({ id: z.string().cuid() }),
					}),
				)
				.optional(),
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
					} satisfies EditComponentDefinitionErrorMessage),
				});
			}
		}

		await prisma.$transaction(async (tx) => {
			// Add new fields to all instances of the component definition
			if (input.addedFields) {
				const addInstanceFields = [];

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

					const promise = new Promise<Promise<unknown>>(async (res) => {
						const instances = await tx.componentInstance.findMany({
							where: { definition_id: input.id },
						});
						const update = instances.map((instance) =>
							tx.componentInstance.update({
								where: { id: instance.id },
								data: {
									fields: {
										create: {
											data: getInitialValue(added.type, true) as string,
											field_definition_id: added.id,
										},
									},
								},
							}),
						);

						res(Promise.all(update));
					});
					addInstanceFields.push(promise);
				}

				await Promise.all(addInstanceFields);
			}

			// When field type has changed, replace value with the initial value, clean up components and array items
			if (input.editedFields) {
				const editedInstanceFields = input.editedFields.map(async (editedField) => {
					if (
						editedField.type !== editedField.original.type ||
						editedField.array_item_type !== editedField.original.array_item_type
					) {
						// Delete component instance if the field type was COMPONENT
						if (editedField.original.type === "COMPONENT") {
							const nested = await tx.componentInstanceField.findMany({
								where: { field_definition_id: editedField.id },
							});
							await tx.componentInstance.deleteMany({
								where: {
									id: {
										in: nested.map((n) => n.data),
									},
								},
							});
						}

						// Delete array items if the field type was COLLECTION
						// NOTE: Thanks to parent_array_item_id's `onDelete: Cascade`,
						// we don't need to manually delete components if array_item_type was of COMPONENT
						if (editedField.original.type === "COLLECTION") {
							const instances = await tx.componentInstanceField.findMany({
								where: { field_definition_id: editedField.id },
							});
							await tx.arrayItem.deleteMany({
								where: {
									parent_field_id: {
										in: instances.map((instance) => instance.id),
									},
								},
							});
						}

						// Reset to initial value
						// This has to be the last operation
						await tx.componentInstanceField.updateMany({
							where: { field_definition_id: editedField.id },
							data: {
								data: getInitialValue(editedField.type, true),
							},
						});
					}
				});
				await Promise.all(editedInstanceFields);
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
