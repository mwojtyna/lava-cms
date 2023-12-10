import { prisma } from "@/prisma/client";
import { publicProcedure } from "@/src/trpc";

export const getHead = publicProcedure.query(async () => {
	const config = await prisma.settingsSeo.findFirstOrThrow();
	const { id, ...rest } = config;

	return rest;
});
