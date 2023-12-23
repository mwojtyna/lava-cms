import { z } from "zod";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";

export const getComponentDefinition = privateProcedure
	.input(
		z.object({
			id: z.string().cuid(),
		}),
	)
	.query(async ({ input }) => {
		const componentDef = await prisma.componentDefinition.findUniqueOrThrow({
			where: {
				id: input.id,
			},
			include: {
				field_definitions: {
					orderBy: {
						order: "asc",
					},
				},
			},
		});
		return componentDef;
	});
