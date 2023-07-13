import { z } from "zod";
import { prisma } from "@admin/prisma/client";
import { publicProcedure } from "@admin/src/trpc";
import type { Page } from "@admin/prisma/types";

export const getPage = publicProcedure
	.input(
		z.object({
			path: z.string(),
		})
	)
	.query(async ({ input }): Promise<Page | null> => {
		let page = await prisma.page.findFirst({
			where: { url: input.path, is_group: false },
		});

		if (!page) {
			page = await prisma.page.findFirst({
				where: { url: input.path + "/", is_group: false },
			});
		}

		return page;
	});
