import type { Page } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@admin/prisma/client";
import { publicProcedure } from "@admin/src/trpc";

export const getPage = publicProcedure
	.input(
		z.object({
			path: z.string(),
		}),
	)
	.query(async ({ input }): Promise<Page | null> => {
		let page = await prisma.page.findFirst({
			where: { url: input.path, is_group: false },
		});

		// Handle trailing slash
		if (!page && !input.path.endsWith("/")) {
			page = await prisma.page.findFirst({
				where: { url: input.path + "/", is_group: false },
			});
		} else if (!page && input.path.endsWith("/")) {
			page = await prisma.page.findFirst({
				where: { url: input.path.replace(/\/$/, ""), is_group: false },
			});
		}

		return page;
	});
