import { z } from "zod";
import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";

export const getPage = publicProcedure
	.input(
		z
			.object({
				url: z.string(),
			})
			.nullish()
	)
	.query(async ({ input }) => {
		if (!input) {
			return prisma.page.findMany({ where: { is_group: false } });
		}

		const page = await prisma.page.findFirst({
			where: { url: input.url },
		});

		return { page };
	});
