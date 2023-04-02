import { publicProcedure } from "@api/trpc";
import { z } from "zod";
import { prisma } from "@api/prisma/client";

export const setConfig = publicProcedure
	.input(
		z.object({
			title: z.string(),
			description: z.string(),
			language: z.string(),
		})
	)
	.mutation(async ({ input }) => {
		const config = await prisma.config.findFirst();

		if (!config) {
			await prisma.config.create({
				data: {
					title: input.title,
					description: input.description,
					language: input.language,
				},
			});
		} else {
			await prisma.config.update({
				where: {
					id: config.id,
				},
				data: {
					title: input.title,
					description: input.description,
					language: input.language,
				},
			});
		}
	});
