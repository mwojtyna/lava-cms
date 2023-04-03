import { z } from "zod";
import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";

export const addPage = publicProcedure
	.input(
		z.object({
			name: z.string(),
			path: z.string().regex(/^\/[a-z0-9]*(?:-[a-z0-9]+)*$/),
			rootPage: z.boolean().optional(),
		})
	)
	.mutation(async ({ input }) => {
		await prisma.pages.create({
			data: {
				name: input.name,
				path: input.path,
				root_page: input.rootPage ?? false,
			},
		});
	});
