import { prisma } from "@admin/prisma/client";
import type { Page } from "@admin/prisma/types";
import { publicProcedure } from "@admin/src/trpc";

export const getAllGroups = publicProcedure.query(async (): Promise<Page[]> => {
	return prisma.page.findMany({
		where: { is_group: true },
	});
});
