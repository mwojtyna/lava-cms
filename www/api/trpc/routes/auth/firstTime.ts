import { publicProcedure } from "@api/trpc/trpc";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const firstTime = publicProcedure.query(async () => {
	const user = await prisma.users.findFirst();
	return user === null;
});
