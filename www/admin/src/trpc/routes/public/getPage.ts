import type { CmsPage, CmsComponent, FieldContent } from "./types";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { type ComponentFieldType, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/prisma/client";
import { publicProcedure } from "@/src/trpc";
import { findPage } from "@/src/trpc/utils";

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
				.filter((c) => c.parent_field_id === null)
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
		const generalField: Field = {
			name: field.definition.name,
			data: field.data,
			serializedRichText: field.serialized_rich_text,
			type: field.definition.type,
			arrayItems: field.array_items.map((ai, i) => ({
				name: `${field.definition.name} -> [item nr ${i}]`,
				data: ai.data,
				serializedRichText: null,
				type: field.definition.array_item_type!,
				arrayItems: [], // A field within an array item cannot be an array item itself
			})),
		};
		const parsedField = await getField(generalField, component);

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
			if (field.data === "") {
				data = null;
				break;
			}

			const nestedComponent = await prisma.componentInstance.findUnique({
				where: { id: field.data },
				include: include.components.include,
			});
			if (!nestedComponent) {
				data = `Error getting \`${parentComponent.definition.name}\` component's \`${field.name}\` field of type \`Component\`: Component instance id \`${field.data}\` does not exist`;
				break;
			}
			data = {
				name: nestedComponent.definition.name,
				fields: await getFields(nestedComponent),
			} satisfies CmsComponent;

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
