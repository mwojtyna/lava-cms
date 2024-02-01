import { z } from "zod";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";

export const getPageByUrl = privateProcedure
	.input(
		z.object({
			url: z.string(),
		}),
	)
	.query(async ({ input }) => {
		const page = await prisma.page.findUniqueOrThrow({
			where: {
				url: input.url,
			},
		});

		return {
			id: page.id,
		};
	});
