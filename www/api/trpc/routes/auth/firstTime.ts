import { publicProcedure } from "@api/trpc/trpc";
import { prisma } from "@api/prisma/client";

export const firstTime = publicProcedure.query(async () => {
	const user = await prisma.users.findFirst();
	return user === null;
});
