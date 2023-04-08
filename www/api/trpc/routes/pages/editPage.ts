import { z } from "zod";
import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";
import { url } from "@api/trpc/regex";

export const editPage = publicProcedure
	.input(
		z.object({
			id: z.string(),
			newName: z.string(),
			newPath: z.string().regex(url),
		})
	)
	.mutation(async ({ input }) => {
		await prisma.page.update({
			where: { id: input.id },
			data: {
				name: input.newName,
				path: input.newPath,
			},
		});
	});
