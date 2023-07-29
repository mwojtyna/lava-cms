import { prisma } from "@admin/prisma/client";
import { privateProcedure } from "@admin/src/trpc";

export const getAllGroups = privateProcedure.query(async () => {
	return await prisma.componentDefinitionGroup.findMany({
		include: {
			parent_group: true,
			_count: {
				select: {
					component_definitions: true,
					groups: true,
				},
			},
		},
		orderBy: {
			name: "asc",
		},
	});
});
