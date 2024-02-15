import cuid from "cuid";
import { z } from "zod";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";
import { arrayItemSchema, componentSchema, parentIdSchema } from "./types";

const addedComponentSchema = z.object({
	frontendId: z.string().cuid2(),
	pageId: z.string().cuid(),
	// This has to be cuid or cuid2 because it also could be a frontend id, which is cuid2
	parentComponentId: parentIdSchema.nullable(),
	parentArrayItemId: parentIdSchema.nullable(),
	definition: z.object({
		id: z.string().cuid(),
		name: z.string(),
	}),
	order: z.number(),
	fields: z.array(
		z.object({
			frontendId: z.string().cuid2(),
			data: z.string(),
			serializedRichText: z.string().nullable(),
			definitionId: z.string().cuid(),
		}),
	),
});

const addedArrayItemSchema = arrayItemSchema.omit({ id: true }).extend({
	frontendId: z.string().cuid2(),
});

export const editPageComponents = privateProcedure
	.input(
		z.object({
			pageId: z.string().cuid(),

			addedComponents: z.array(addedComponentSchema),
			editedComponents: z.array(componentSchema),
			deletedComponentIds: z.array(z.string().cuid()),

			addedArrayItems: z.array(addedArrayItemSchema),
			editedArrayItems: z.array(arrayItemSchema),
			deletedArrayItemIds: z.array(z.string().cuid()),
		}),
	)
	.mutation(async ({ input }): Promise<Record<string, string>> => {
		// Use cuid1 to make it consistent with prisma
		const addedComponentIds: Record<string, string> = {};
		for (const comp of input.addedComponents) {
			addedComponentIds[comp.frontendId] = cuid();
		}

		const addedArrayItemIds: Record<string, string> = {};
		for (const item of input.addedArrayItems) {
			addedArrayItemIds[item.frontendId] = cuid();
		}

		const addedFieldIds: Record<string, string> = {};

		// NOTE: We don't have to manually delete any nested components (even when they're inside array items) when their parents are deleted,
		// because those components have parentComponentId set, even when they're inside an array item. So when the parent component is deleted,
		// all components which reference it are also deleted all the way down the tree. Same goes for array items (because of `parent_array_item_id`)
		await prisma.$transaction(async (tx) => {
			// Add new array items
			await tx.arrayItem.createMany({
				data: input.addedArrayItems.map((item) => ({
					id: addedArrayItemIds[item.frontendId],
					data:
						item.data in addedComponentIds ? addedComponentIds[item.data]! : item.data,
					order: item.order,
					parent_field_id:
						item.parentFieldId in addedFieldIds
							? addedFieldIds[item.parentFieldId]!
							: item.parentFieldId,
				})),
			});

			// Add new components
			const addedComponents = input.addedComponents.map((component) => {
				let parentComponentId = component.parentComponentId;
				if (parentComponentId !== null && parentComponentId in addedComponentIds) {
					parentComponentId = addedComponentIds[parentComponentId]!;
				}

				let parentArrayItemId = component.parentArrayItemId;
				if (parentArrayItemId !== null && parentArrayItemId in addedArrayItemIds) {
					parentArrayItemId = addedArrayItemIds[parentArrayItemId]!;
				}

				return tx.componentInstance.create({
					data: {
						id: addedComponentIds[component.frontendId],
						page_id: component.pageId,
						parent_component_id: parentComponentId,
						parent_array_item_id: parentArrayItemId,
						definition_id: component.definition.id,
						order: component.order,
						fields: {
							createMany: {
								data: component.fields.map((field) => {
									const id = cuid();
									addedFieldIds[field.frontendId] = id;
									return {
										id,
										data: field.data,
										serialized_rich_text: field.serializedRichText,
										field_definition_id: field.definitionId,
									};
								}),
							},
						},
					},
				});
			});
			await Promise.all(addedComponents);

			// Edit existing components
			const editedComponents = input.editedComponents.map((component) =>
				tx.componentInstance.update({
					where: { id: component.id },
					data: {
						order: component.order,
						definition_id: component.definition.id,
						parent_component_id: component.parentComponentId,
						fields: {
							updateMany: component.fields.map((field) => ({
								where: { id: field.id },
								data: {
									data: field.data,
									serialized_rich_text: field.serializedRichText,
								},
							})),
						},
					},
				}),
			);
			await Promise.all(editedComponents);

			// Delete components
			await tx.componentInstance.deleteMany({
				where: {
					id: {
						in: input.deletedComponentIds,
					},
				},
			});

			// Correct component data field (if it was a frontend id) to a backend id
			const correctedComponents = Object.entries(addedComponentIds).map(([k, v]) =>
				tx.componentInstanceField.updateMany({
					where: {
						data: {
							equals: k,
						},
					},
					data: {
						data: v,
					},
				}),
			);
			await Promise.all(correctedComponents);

			// Empty data field if it was an id to a deleted component
			await tx.componentInstanceField.updateMany({
				where: {
					data: {
						in: input.deletedComponentIds,
					},
				},
				data: {
					data: "",
				},
			});

			// Edit existing array items
			const editedArrayItems = input.editedArrayItems.map((item) =>
				tx.arrayItem.update({
					where: { id: item.id },
					data: {
						data:
							item.data in addedComponentIds
								? addedComponentIds[item.data]!
								: item.data,
						order: item.order,
					},
				}),
			);
			await Promise.all(editedArrayItems);

			// Delete array items
			await tx.arrayItem.deleteMany({
				where: {
					id: {
						in: input.deletedArrayItemIds,
					},
				},
			});
		});

		return addedComponentIds;
	});
