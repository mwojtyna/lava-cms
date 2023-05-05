import { publicProcedure } from "@api/trpc";
import { prisma } from "@api/prisma/client";

export const setupRequired = publicProcedure.query(async () => {
	const user = await prisma.user.findFirst();
	const config = await prisma.config.findFirst();
	const setupRequired = user === null || config === null;

	return {
		...(setupRequired && {
			reason: user === null ? ("no-user" as const) : ("no-config" as const),
		}),
	} as const;
});
