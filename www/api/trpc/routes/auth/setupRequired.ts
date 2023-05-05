import { publicProcedure } from "@api/trpc";
import { prisma } from "@api/prisma/client";

export const setupRequired = publicProcedure.query(async () => {
	const user = await prisma.user.findFirst();
	const config = await prisma.config.findFirst();

	if (!user) {
		return { reason: "no-user" as const };
	}
	if (!config) {
		return { reason: "no-config" as const };
	}
	return { reason: null };
});
