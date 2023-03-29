import { publicProcedure } from "@api/trpc";
import { prisma } from "@api/prisma/client";

export const getConfig = publicProcedure.query(async () => {
	const config = await prisma.config.findFirstOrThrow();
	const { id, ...rest } = config;

	return rest;
});
