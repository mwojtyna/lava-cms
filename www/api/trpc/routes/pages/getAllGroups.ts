import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";

export const getAllGroups = publicProcedure.query(async () => {
	return prisma.page.findMany({
		where: { is_group: true },
	});
});
