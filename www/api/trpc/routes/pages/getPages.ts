import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";

export const getPages = publicProcedure.query(async () => {
	return await prisma.page.findMany();
});
