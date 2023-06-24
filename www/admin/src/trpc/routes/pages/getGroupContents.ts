import { prisma } from "@admin/prisma/client";
import type { Page } from "@admin/prisma/types";
import { publicProcedure } from "@admin/src/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const getGroupContents = publicProcedure
	.input(z.object({ id: z.string() }).nullish())
	.query(async ({ input }): Promise<{ breadcrumbs: Page[]; pages: Page[] }> => {
		// Return root group contents if no input is provided
		if (!input) {
			return {
				breadcrumbs: [],
				pages: await prisma.page
					.findFirst({ where: { parent_id: null } })
					.then((rootGroup) => {
						return prisma.page.findMany({ where: { parent_id: rootGroup!.id } });
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

async function getBreadcrumbs(group: Page) {
	const breadcrumbs = [group];
	let parent = await prisma.page.findUnique({ where: { id: group.parent_id ?? "" } });

	// Ignore root group so we can add a custom breadcrumb for it
	while (parent && parent.parent_id) {
		breadcrumbs.push(parent);
		parent = await prisma.page.findUnique({ where: { id: parent.parent_id ?? "" } });
	}

	return breadcrumbs.reverse();
}
