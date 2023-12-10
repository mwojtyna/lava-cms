import { prisma } from "@admin/prisma/client";
import { publicProcedure } from "@admin/src/trpc";

export const getHead = publicProcedure.query(async () => {
	const config = await prisma.settingsSeo.findFirstOrThrow();
	const { id, ...rest } = config;

	return rest;
});
