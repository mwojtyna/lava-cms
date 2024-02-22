import type { ArrayItem, Component } from "./types";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";

export const getPageComponents = privateProcedure
	.input(
		z.object({
			id: z.string().cuid(),
		}),
	)
	.query(
		async ({
			input,
		}): Promise<{
			components: Component[];
			nestedComponents: Component[];
			arrayItems: ArrayItem[];
		}> => {
			const page = await prisma.page.findFirstOrThrow({
				where: {
					id: input.id,
				},
				include: {
					components: {
						include: {
							fields: {
								include: {
									definition: true,
								},
								orderBy: {
									definition: {
										order: "asc",
									},
								},
							},
							definition: true,
						},
						orderBy: {
							order: "asc",
						},
					},
				},
			});
			if (page.is_group) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message:
						"The page you're requesting is a group. This page cannot be edited in the page editor. It's likely that you're not adding a trailing slash to the URL.",
				});
			}

			const components: Component[] = page.components.map((component) => {
				const fields: Component["fields"] = component.fields.map((field) => ({
					id: field.id,
					name: field.definition.name,
					data: field.data,
					serializedRichText: field.serialized_rich_text,
					type: field.definition.type,
					arrayItemType: field.definition.array_item_type,
					definitionId: field.definition.id,
					order: field.definition.order,
				}));

				return {
					id: component.id,
					definition: {
						id: component.definition.id,
						name: component.definition.name,
					},
					pageId: component.page_id,
					parentFieldId: component.parent_field_id,
					order: component.order,
					fields,
				};
			});

			const arrayItems = await prisma.arrayItem.findMany({
				orderBy: {
					order: "asc",
				},
			});

			return {
				components: components.filter((c) => c.parentFieldId === null),
				nestedComponents: components.filter((c) => c.parentFieldId !== null),
				arrayItems: arrayItems.map((item) => ({
					id: item.id,
					data: item.data,
					order: item.order,
					parentFieldId: item.parent_field_id,
				})),
			};
		},
	);
