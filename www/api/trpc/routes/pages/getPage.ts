import { z } from "zod";
import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";
import type { Page } from "@api/prisma/types";

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
