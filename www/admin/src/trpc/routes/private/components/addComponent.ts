import { z } from "zod";
import { prisma } from "@admin/prisma/client";
import { privateProcedure } from "@admin/src/trpc";

export const addComponent = privateProcedure
	.input(
		z.object({
			name: z.string().min(1),
			pageId: z.string().cuid(),
			definitionId: z.string().cuid(),
			fieldsData: z.array(z.string().min(1)),
		}),
	)
	.mutation(async ({ input }) => {
		// TODO: Create field instances when creating component instance
		// const instance = await prisma.componentInstance.create({
		// 	data: {
		// 		name: input.name,
		// 		page_id: input.pageId,
		// 		definition_id: input.definitionId,
		// 	},
		// });
		// await prisma.componentInstanceField.createMany({
		// 	data: input.fieldsData.map((data) => ({
		// 		component_id: instance.id,
		// 		data,
		// 	})),
		// });
	});
