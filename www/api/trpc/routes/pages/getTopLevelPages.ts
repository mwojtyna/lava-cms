import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";

export const getTopLevelPages = publicProcedure.query(async () => {
	return prisma.page.findMany({
		where: {
			parent_id: null,
		},
	});
});
