import { z } from "zod";
import { prisma } from "@admin/src/prisma/client";
import { publicProcedure } from "@admin/src/trpc";
import type { Page } from "@admin/src/prisma/types";

export const getPage = publicProcedure
	.input(
		z.object({
			url: z.string(),
		})
	)
	.query(async ({ input }): Promise<Page | null> => {
		return prisma.page.findUnique({
			where: { url: input.url },
		});
	});
