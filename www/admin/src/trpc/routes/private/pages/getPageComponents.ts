import { z } from "zod";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";

interface Component {
	id: string;
	name: string;
	definitionName: string;
	order: number;
	fields: Field[];
}
interface Field {
	id: string;
	name: string;
	data: string;
	type: string;
}

export const getPageComponents = privateProcedure
	.input(
		z.object({
			id: z.string().cuid(),
		}),
	)
	.query(async ({ input }): Promise<Component[]> => {
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
						},
						definition: true,
					},
					orderBy: {
						order: "asc",
					},
				},
			},
		});

		const components: Component[] = page.components.map((component) => {
			const fields = component.fields.map((field) => ({
				id: field.id,
				name: field.definition.name,
				data: field.data,
				type: field.definition.type,
			}));

			return {
				id: component.id,
				name: component.name,
				definitionName: component.definition.name,
				order: component.order,
				fields,
			};
		});

		return components;
	});
