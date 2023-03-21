import { publicProcedure } from "@api/trpc";
import { prisma } from "@api/prisma/client";

export const firstTime = publicProcedure.query(async () => {
	const user = await prisma.user.findFirst();
	const config = await prisma.config.findFirst();

	return {
		firstTime: user === null && config === null,
		signedUp: user !== null,
		configSet: config !== null,
	};
});
