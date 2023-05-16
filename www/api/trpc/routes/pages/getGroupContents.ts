import { prisma } from "@api/prisma/client";
import type { Page } from "@api/prisma/types";
import { publicProcedure } from "@api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const getGroupContents = publicProcedure
	.input(z.object({ id: z.string() }).nullish())
	.query(async ({ input }): Promise<{ breadcrumbs: Page[]; pages: Page[] }> => {
		// Return top-level pages if no ID is provided
		if (!input) {
			return {
				breadcrumbs: [],
				pages: await prisma.page.findMany({
					where: {
						parent_id: null,
					},
				}),
			};
		}

		const group = await prisma.page.findFirst({
			where: {
				id: input.id,
				is_group: true,
			},
			include: { children: true },
		});
		if (!group) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}

		const breadcrumbs = await getBreadcrumbs(group);
		return {
			breadcrumbs,
			pages: group.children,
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
