import { z } from "zod";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";
import { componentSchema } from "./types";

export const editPageComponents = privateProcedure
	.input(
		z.object({
			pageId: z.string().cuid(),
			editedComponents: z.array(componentSchema),
		}),
	)
	.mutation(async ({ input }) => {
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

		await prisma.$transaction([...edited]);
	});
