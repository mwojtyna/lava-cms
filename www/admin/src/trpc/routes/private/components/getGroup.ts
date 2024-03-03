import type { ComponentInstancePreview, GroupItem } from "./types";
import type { ComponentDefinitionGroup } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import natsort from "natsort";
import { z } from "zod";
import { prisma } from "@/prisma/client";
import type { Breadcrumb } from "@/src/components/DataTable";
import { privateProcedure } from "@/src/trpc";

const include = {
	groups: {
		orderBy: {
			name: "asc",
		},
	},
	component_definitions: {
		orderBy: {
			name: "asc",
		},
		include: {
			instances: { include: { page: true } },
			field_definitions: {
				orderBy: {
					order: "asc",
				},
			},
		},
	},
} satisfies Prisma.ComponentDefinitionGroupInclude<DefaultArgs>;
const groupWithIncludes = Prisma.validator<Prisma.ComponentDefinitionGroupDefaultArgs>()({
	include,
});
type GroupWithIncludes = Prisma.ComponentDefinitionGroupGetPayload<typeof groupWithIncludes>;

export const getGroup = privateProcedure
	.input(
		z
			.object({
				id: z.string().cuid(),
			})
			.nullish(),
	)
	.query(
		async ({
			input,
		}): Promise<{
			group: ComponentDefinitionGroup;
			items: GroupItem[];
			breadcrumbs: Breadcrumb[];
		}> => {
			// Get root group if no input is provided
			if (!input) {
				const group = await prisma.componentDefinitionGroup.findFirstOrThrow({
					where: {
						parent_group_id: null,
					},
					include,
				});
				const items = groupItems(group);

				return {
					// `group` has more fields, but we only need these
					// typescript doesn't catch this when putting `group` in the return value
					group: {
						id: group.id,
						name: group.name,
						parent_group_id: null,
						last_update: group.last_update,
					},
					items,
					breadcrumbs: [],
				};
			}

			const group = await prisma.componentDefinitionGroup.findUnique({
				where: {
					id: input.id,
				},
				include,
			});
			if (!group) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const items = groupItems(group);
			const breadcrumbs = await getBreadcrumbs(group);

			return {
				// `group` has more fields, but we only need these
				// typescript doesn't catch this when putting `group` in the return value
				group: {
					id: group.id,
					name: group.name,
					parent_group_id: null,
					last_update: group.last_update,
				},
				items,
				breadcrumbs,
			};
		},
	);

function groupItems(group: GroupWithIncludes): GroupItem[] {
	const groups: GroupItem[] = group.groups
		.toSorted((a, b) => natsort()(a.name, b.name))
		.map((group) => ({
			id: group.id,
			name: group.name,
			parentGroupId: group.parent_group_id,
			lastUpdate: group.last_update,
			isGroup: true,
		}));

	const componentDefinitions: GroupItem[] = group.component_definitions
		.toSorted((a, b) => natsort()(a.name, b.name))
		.map((component) => {
			let allCount = 0;
			const instances = component.instances.reduce<Record<string, ComponentInstancePreview>>(
				(acc, instance) => {
					allCount++;
					const current = acc[instance.page_id];
					acc[instance.page_id] = current
						? {
								...current,
								count: current.count + 1,
							}
						: {
								pageName: instance.page.name,
								count: 1,
							};
					return acc;
				},
				{},
			);

			return {
				id: component.id,
				name: component.name,
				parentGroupId: component.group_id,
				lastUpdate: component.last_update,
				isGroup: false,
				instances: {
					pageToInstance: instances,
					count: allCount,
				},
				fieldDefinitions: component.field_definitions,
			};
		});

	return [...groups, ...componentDefinitions];
}

async function getBreadcrumbs(group: ComponentDefinitionGroup): Promise<Breadcrumb[]> {
	const breadcrumbs = await prisma.$queryRaw<Breadcrumb[]>`
	WITH RECURSIVE breadcrumbs AS (
  	  SELECT
    	id,
    	name,
    	parent_group_id
  	  FROM
    	component_definition_group
  	  WHERE
    	id = ${group.id}
  	  UNION
  	  SELECT
    	cdg.id,
    	cdg.name,
    	cdg.parent_group_id
  	  FROM
    	component_definition_group cdg
  	  INNER JOIN
    	breadcrumbs bc
  	  ON
    	cdg.id = bc.parent_group_id
  	  WHERE cdg.parent_group_id IS NOT NULL
	)
	SELECT
  	  id,
  	  name
	FROM
  	  breadcrumbs;
`;

	return breadcrumbs.reverse();
}
