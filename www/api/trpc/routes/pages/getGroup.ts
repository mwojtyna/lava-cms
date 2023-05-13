import { prisma } from "@api/prisma/client";
import type { Page } from "@api/prisma/types";
import { publicProcedure } from "@api/trpc";
import { z } from "zod";

export const getGroup = publicProcedure
	.input(z.object({ id: z.string() }))
	.query(async ({ input }) => {
		const group = await prisma.page.findFirst({
			where: {
				id: input.id,
				is_group: true,
			},
		});
		const pages = await prisma.page.findMany({ where: { parent_id: input.id } });
		const breadcrumbs = await getBreadcrumbs(group);

		return {
			breadcrumbs,
			pages,
		};
	});

async function getBreadcrumbs(page: Page | null) {
	if (!page) return [];

	const breadcrumbs = [page];
	let parent = await prisma.page.findUnique({ where: { id: page.parent_id ?? "" } });

	if (!parent) return breadcrumbs;

	while (parent) {
		breadcrumbs.push(parent);
		parent = await prisma.page.findUnique({ where: { id: parent.parent_id ?? "" } });
	}

	return breadcrumbs.reverse();
}
