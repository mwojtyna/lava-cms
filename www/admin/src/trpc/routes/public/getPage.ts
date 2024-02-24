import type { CmsPage, CmsComponent, FieldContent } from "./types";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { type ComponentFieldType, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/prisma/client";
import { publicProcedure } from "@/src/trpc";
import { findPage, isTopLevelComponent } from "@/src/trpc/utils";

const include = {
	components: {
		orderBy: {
			order: "asc",
		},
		include: {
			fields: {
				include: {
					definition: true,
					array_items: {
						orderBy: {
							order: "asc",
						},
					},
				},
			},
			definition: true,
		},
	},
} satisfies Prisma.PageInclude<DefaultArgs>;
const pageWithInclude = Prisma.validator<Prisma.PageDefaultArgs>()({
	include,
});

type Page = Prisma.PageGetPayload<typeof pageWithInclude>;
type Component = Page["components"][number];
interface Field {
	id: string;
	parentFieldId?: string;
	name: string;
	data: string;
	serializedRichText: string | null;
	type: ComponentFieldType;
	arrayItems: Field[];
}

export const getPage = publicProcedure
	.input(
		z.object({
			path: z.string(),
		}),
	)
	.query(async ({ input }): Promise<CmsPage | null> => {
		// Can't type this in the function itself based on the include, which will only be known at runtime
		const page = (await findPage(input.path, include)) as Page;

		if (!page) {
			return null;
		}

		const components: CmsComponent[] = await Promise.all(
			page.components
				.filter((c) => isTopLevelComponent(c.parent_field_id, c.parent_array_item_id))
				.map(async (component) => ({
					name: component.definition.name,
					fields: await getFields(component),
				})),
		);
		return {
			name: page.name,
			url: page.url.replace(/\/$/, ""),
			components,
		};
	});

async function getFields(component: Component): Promise<Record<string, FieldContent>> {
	return component.fields.reduce<Promise<CmsComponent["fields"]>>(async (acc, field) => {
		const generalizedField: Field = {
			id: field.id,
			name: field.definition.name,
			data: field.data,
			serializedRichText: field.serialized_rich_text,
			type: field.definition.type,
			arrayItems: field.array_items.map((ai, i) => ({
				id: ai.id,
				parentFieldId: field.id,
				name: `${field.definition.name} -> [item nr ${i}]`,
				data: ai.data,
				serializedRichText: null,
				type: field.definition.array_item_type!,
				arrayItems: [], // An array item cannot contain array items
			})),
		};
		const parsedField = await getField(generalizedField, component);

		const accAwaited = await acc;
		accAwaited[field.definition.name] = parsedField;
		return accAwaited;
	}, Promise.resolve({}));
}

async function getField(field: Field, parentComponent: Component): Promise<FieldContent> {
	let data: FieldContent;

	switch (field.type) {
		case "TEXT": {
			data = field.data;
			break;
		}
		case "RICH_TEXT": {
			data = field.serializedRichText!;
			break;
		}
		case "NUMBER": {
			data = parseFloat(field.data);
			break;
		}
		case "SWITCH": {
			data = field.data === "true";
			break;
		}
		case "COMPONENT": {
			let nestedComponent = await prisma.componentInstance.findUnique({
				where: { parent_field_id: field.id },
				include: include.components.include,
			});
			if (!nestedComponent) {
				nestedComponent = await prisma.componentInstance.findUnique({
					where: { parent_array_item_id: field.id },
					include: include.components.include,
				});
			}
			if (!nestedComponent) {
				data = null;
				break;
			}

			data = {
				name: nestedComponent.definition.name,
				fields: await getFields(nestedComponent),
			};

			break;
		}
		case "COLLECTION": {
			const arrayFields = await Promise.all(
				field.arrayItems.map((ai) => getField(ai, parentComponent)),
			);
			data = arrayFields;
			break;
		}
	}

	return data;
}
