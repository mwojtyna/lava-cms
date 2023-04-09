import { z } from "zod";
import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";
import { url } from "@api/trpc/regex";

export const addPage = publicProcedure
	.input(
		z.object({
			name: z.string(),
			url: z.string().regex(url),
			rootPage: z.boolean().optional(),
		})
	)
	.mutation(async ({ input }) => {
		await prisma.page.create({
			data: {
				name: input.name,
				url: input.url,
			},
		});
	});
