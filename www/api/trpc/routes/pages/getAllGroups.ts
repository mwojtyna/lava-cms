import { prisma } from "@api/prisma/client";
import type { Page } from "@api/prisma/types";
import { publicProcedure } from "@api/trpc";

export const getAllGroups = publicProcedure.query(async (): Promise<Page[]> => {
	return prisma.page.findMany({
		where: { is_group: true },
	});
});
