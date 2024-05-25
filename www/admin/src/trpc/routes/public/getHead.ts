import { prisma } from "@/prisma/client";
import { publicProcedure } from "@/src/trpc";

export const getHead = publicProcedure.query(async () => {
	const config = await prisma.settingsSeo.findFirstOrThrow({ omit: { id: true } });
	return config;
});
