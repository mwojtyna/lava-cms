import { publicProcedure } from "@api/trpc";
import { prisma } from "@api/prisma/client";

export const getConfig = publicProcedure.query(async () => {
	return await prisma.config.findFirstOrThrow();
});
