import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";
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
export interface Page {
	name: string;
	components: Component[];
}
export interface Component {
	name: string;
	fields: Record<string, ContentType>;
}
export type ContentType = string | number | boolean | object;

export const getPage = publicProcedure
	.input(
		z.object({
			path: z.string(),
		}),
	)
	.query(async ({ input }): Promise<Page | null> => {
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
		} else {
			const components = page.components.map((component) => ({
				name: component.definition.name,
				fields: component.fields.reduce<Record<string, ContentType>>((acc, field) => {
					let data: ContentType;

					switch (field.definition.type) {
						case "TEXT": {
							data = field.data;
							break;
						}
						case "NUMBER": {
							data = Number(field.data);
							break;
						}
						case "SWITCH": {
							data = field.data === "true";
							break;
						}
						case "COMPONENT": {
							try {
								data = JSON.parse(field.data) as object;
							} catch (e) {
								data = `Error parsing '${component.definition.name}' component's '${field.definition.name}' field`;
							}
							break;
						}
					}

					acc[field.definition.name] = data;
					return acc;
				}, {}),
			}));

			return {
				name: page.name,
				components,
			};
		}
	});
