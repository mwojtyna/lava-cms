import { z } from "zod";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";
import { componentSchema } from "./types";

const addedComponentSchema = z.object({
	frontendId: z.string(),
	pageId: z.string().cuid(),
	parentComponentId: z.string().cuid().nullable(),
	definition: z.object({
		id: z.string().cuid(),
		name: z.string(),
	}),
	order: z.number(),
	fields: z.array(
		z.object({
			data: z.string(),
			definitionId: z.string(),
		}),
	),
});

export const editPageComponents = privateProcedure
	.input(
		z.object({
			pageId: z.string().cuid(),
			addedComponents: z.array(addedComponentSchema),
			editedComponents: z.array(componentSchema),
			deletedComponentIds: z.array(z.string().cuid()),
		}),
	)
	.mutation(async ({ input }): Promise<Record<string, string>> => {
		const addedComponentIds: Record<string, string> = {};

		await prisma.$transaction(async (tx) => {
			for (const component of input.addedComponents) {
				const added = await tx.componentInstance.create({
					data: {
						page_id: component.pageId,
						parent_component_id: component.parentComponentId,
						definition_id: component.definition.id,
						order: component.order,
						fields: {
							createMany: {
								data: component.fields.map((field) => ({
									data: field.data,
									field_definition_id: field.definitionId,
								})),
							},
						},
					},
				});
				addedComponentIds[component.frontendId] = added.id;
			}

			for (const component of input.editedComponents) {
				await tx.componentInstance.update({
					where: { id: component.id },
					data: {
						order: component.order,
						fields: {
							updateMany: component.fields.map((field) => ({
								where: { id: field.id },
								data: {
									data:
										// If the field data is a reference to a newly created nested component,
										// replace it with the backend id
										field.data in addedComponentIds
											? addedComponentIds[field.data]
											: field.data,
								},
							})),
						},
					},
				});
			}

			await tx.componentInstance.deleteMany({
				where: {
					id: {
						in: input.deletedComponentIds,
					},
				},
			});
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
		});

		return addedComponentIds;
	});
