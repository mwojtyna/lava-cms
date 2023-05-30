import { z } from "zod";
import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";

export const getPage = publicProcedure
	.input(
		z.object({
			url: z.string(),
		})
	)
	.query(async ({ input }) => {
		return prisma.page.findUnique({
			where: { url: input.url },
		});
	});
