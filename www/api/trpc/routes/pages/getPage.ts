import { z } from "zod";
import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";
import { TRPCError } from "@trpc/server";

export const getPage = publicProcedure
	.input(
		z.object({
			url: z.string(),
		})
	)
	.query(async ({ input }) => {
		const page = await prisma.page.findUnique({ where: { url: input.url } });

		if (!page) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}

		const children = await prisma.page.findMany({
			where: {
				parent_id: { equals: page.id },
			},
		});

		return { page, children };
	});
