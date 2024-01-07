import type { DefaultArgs } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/prisma/client";
import { publicProcedure } from "@/src/trpc";

const include = {
	components: {
		orderBy: {
			order: "asc",
		},
		include: {
			fields: {
				include: {
					definition: true,
				},
			},
			definition: true,
		},
	},
} satisfies Prisma.PageInclude<DefaultArgs>;

// Has to be exported for @lavacms/types
export interface CmsPage {
	name: string;
	components: CmsComponent[];
}
export interface CmsComponent {
	name: string;
	fields: Record<string, FieldContent>;
}
export type FieldContent = string | number | boolean | object | null;

export const getPage = publicProcedure
	.input(
		z.object({
			path: z.string(),
		}),
	)
	.query(async ({ input }): Promise<CmsPage | null> => {
		let page = await prisma.page.findFirst({
			where: {
				url: input.path,
				is_group: false,
			},
			include,
		});

		// Handle trailing slash
		if (!page && !input.path.endsWith("/")) {
			page = await prisma.page.findFirst({
				where: {
					url: input.path + "/",
					is_group: false,
				},
				include,
			});
		} else if (!page && input.path.endsWith("/")) {
			page = await prisma.page.findFirst({
				where: {
					url: input.path.replace(/\/$/, ""),
					is_group: false,
				},
				include,
			});
		}

		if (!page) {
			return null;
		}

		const components: CmsComponent[] = await Promise.all(
			page.components
				.filter((c) => c.parent_component_id === null)
				.map(async (component) => ({
					name: component.definition.name,
					fields: await getFields(component),
				})),
		);
		return {
			name: page.name,
			components,
		};
	});

const pageWithInclude = Prisma.validator<Prisma.PageDefaultArgs>()({
	include,
});
type Component = Prisma.PageGetPayload<typeof pageWithInclude>["components"][number];
function getFields(component: Component): Promise<Record<string, FieldContent>> {
	return component.fields.reduce<Promise<CmsComponent["fields"]>>(async (acc, field) => {
		let data: FieldContent;

		switch (field.definition.type) {
			case "TEXT": {
				data = field.data;
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
					data = `Error getting \`${component.definition.name}\` component's \`${field.definition.name}\` field of type \`Component\`: Component instance id \`${field.data}\` does not exist`;
					break;
				}
				data = {
					name: nestedComponent.definition.name,
					fields: await getFields(nestedComponent),
				} satisfies CmsComponent;

				break;
			}
			case "ARRAY": {
				// TODO: Implement
				data = "Array not implemented";
				break;
			}
		}

		const accAwaited = await acc;
		accAwaited[field.definition.name] = data;
		return accAwaited;
	}, Promise.resolve({}));
}
