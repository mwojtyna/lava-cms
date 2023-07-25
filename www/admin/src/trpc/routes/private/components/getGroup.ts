import { z } from "zod";
import type { ComponentDefinitionGroup } from "@prisma/client";
import { prisma } from "@admin/prisma/client";
import { privateProcedure } from "@admin/src/trpc";
import { TRPCError } from "@trpc/server";
import { Play } from "next/font/google";

export const getGroup = privateProcedure
	.input(
		z
			.object({
				id: z.string().cuid(),
			})
			.nullish(),
	)
	.query(async ({ input }) => {
		// Get root group if no input is provided
		if (!input) {
			const group = await prisma.componentDefinitionGroup.findFirstOrThrow({
				where: {
					parent_group_id: null,
				},
				include: {
					groups: true,
					component_definitons: {
						include: {
							components: true,
						},
					},
				},
			});

			return {
				group,
				breadcrumbs: [],
			};
		}

		const group = await prisma.componentDefinitionGroup.findUnique({
			where: {
				id: input.id,
			},
			include: {
				groups: true,
				component_definitons: {
					include: {
						components: true,
					},
				},
			},
		});
		if (!group) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}

		const breadcrumbs = await getBreadcrumbs(group);
		return {
			group,
			breadcrumbs,
		};
	});

async function getBreadcrumbs(group: ComponentDefinitionGroup) {
	const breadcrumbs = [group];
	let parent = await prisma.componentDefinitionGroup.findUnique({
		where: {
			id: group.parent_group_id ?? "",
		},
	});

	// Ignore root group so we can add a custom breadcrumb for it
	while (parent && parent.parent_group_id) {
		breadcrumbs.push(parent);
		parent = await prisma.componentDefinitionGroup.findUnique({
			where: {
				id: parent.parent_group_id,
			},
		});
	}

	return breadcrumbs.reverse();
}
