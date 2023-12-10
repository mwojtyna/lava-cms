import type { Page } from "@prisma/client";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";

export const getAllGroups = privateProcedure.query(async (): Promise<Page[]> => {
	return prisma.page.findMany({
		where: {
			is_group: true,
		},
		orderBy: {
			url: "asc",
		},
	});
});
