import { z } from "zod";
import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";
import { url as urlRegex } from "@api/trpc/regex";

export const editPage = publicProcedure
	.input(
		z.object({
			id: z.string(),
			newName: z.string(),
			oldUrl: z.string().regex(urlRegex),
			newUrl: z.string().regex(urlRegex),
		})
	)
	.mutation(async ({ input }) => {
		await prisma.$transaction([
			prisma.page.update({
				where: { id: input.id },
				data: {
					name: input.newName,
					url: input.newUrl,
				},
			}),
			prisma.$executeRaw`UPDATE frontend.page SET "url" = REPLACE("url", ${input.oldUrl} || '/', ${input.newUrl} || '/') WHERE "url" LIKE ${input.oldUrl} || '/%';`,
		]);
	});
