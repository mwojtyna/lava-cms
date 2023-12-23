import { z } from "zod";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";
import { componentSchema } from "./types";

const addedComponentSchema = z.object({
	name: z.string(),
	pageId: z.string().cuid(),
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
		}),
	)
	.mutation(async ({ input }) => {
		const added = input.addedComponents.map((component) =>
			prisma.componentInstance.create({
				data: {
					name: component.name,
					page_id: component.pageId,
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
			}),
		);

		const edited = input.editedComponents.map((component) =>
			prisma.componentInstance.update({
				where: { id: component.id },
				data: {
					fields: {
						update: component.fields.map((field) => ({
							where: { id: field.id },
							data: { data: field.data },
						})),
					},
				},
			}),
		);

		await prisma.$transaction([...added, ...edited]);
	});
