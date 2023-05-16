import { z } from "zod";
import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";
import { TRPCError } from "@trpc/server";

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

		const page = await prisma.page.findUnique({
			where: { url: input.url },
			include: { children: true },
		});
		if (!page) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}

		return { page, children: page.children };
	});
