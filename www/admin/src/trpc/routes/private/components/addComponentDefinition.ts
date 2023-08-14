import { z } from "zod";
import { privateProcedure } from "@admin/src/trpc";
import { ComponentFieldDefinitionSchema } from "@admin/prisma/generated/zod";
import { prisma } from "@admin/prisma/client";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const addComponentDefinition = privateProcedure
	.input(
		z.object({
			name: z.string(),
			groupId: z.string().cuid(),
			fields: z.array(ComponentFieldDefinitionSchema.pick({ name: true, type: true })),
		}),
	)
	.mutation(async ({ input }) => {
		try {
			await prisma.$transaction(async (tx) => {
				const { id: componentDefinitionId } = await tx.componentDefinition.create({
					data: {
						name: input.name,
						group_id: input.groupId,
					},
				});
				await tx.componentFieldDefinition.createMany({
					data: input.fields.map((field, i) => ({
						name: field.name,
						type: field.type,
						order: i,
						component_definition_id: componentDefinitionId,
					})),
				});
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new TRPCError({ code: "CONFLICT" });
				}
			}
		}
	});
