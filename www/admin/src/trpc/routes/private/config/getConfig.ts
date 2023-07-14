import { privateProcedure } from "@admin/src/trpc";
import { prisma } from "@admin/prisma/client";

export const getConfig = privateProcedure.query(async () => {
	const config = await prisma.config.findFirstOrThrow();
	const { id, ...rest } = config;

	return rest;
});
