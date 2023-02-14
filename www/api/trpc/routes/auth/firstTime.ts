import { publicProcedure } from "@api/trpc";
import { prisma } from "@api/prisma/client";

export const firstTime = publicProcedure.query(async () => {
	const user = await prisma.user.findFirst();
	return { firstTime: user === null };
});
