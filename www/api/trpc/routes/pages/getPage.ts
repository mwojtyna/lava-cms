import { z } from "zod";
import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";

export const getPage = publicProcedure
	.input(
		z.object({
			path: z.string(),
		})
	)
	.query(async ({ input }) => {
		return await prisma.page.findUnique({
			where: {
				path: input.path,
			},
		});
	});
