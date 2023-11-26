import { prisma } from "@admin/prisma/client";
import type { Page } from "@prisma/client";
import { privateProcedure } from "@admin/src/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Breadcrumb } from "@admin/src/components/DataTable";

export const getGroupContents = privateProcedure
	.input(z.object({ id: z.string() }).nullish())
	.query(async ({ input }): Promise<{ breadcrumbs: Breadcrumb[]; pages: Page[] }> => {
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

async function getBreadcrumbs(page: Page): Promise<Breadcrumb[]> {
	const breadcrumbs = await prisma.$queryRaw<Breadcrumb[]>`
	WITH RECURSIVE breadcrumbs AS (
  	  SELECT
    	id,
    	name,
    	parent_id
  	  FROM
    	page
  	  WHERE
    	id = ${page.id}
  	  UNION
  	  SELECT
    	p.id,
    	p.name,
    	p.parent_id
  	  FROM
    	page p
  	  INNER JOIN
    	breadcrumbs bc
  	  ON
    	p.id = bc.parent_id
  	  WHERE p.parent_id IS NOT NULL
	)
	SELECT
  	  id,
  	  name
	FROM
  	  breadcrumbs;
`;

	return breadcrumbs.reverse();
}
