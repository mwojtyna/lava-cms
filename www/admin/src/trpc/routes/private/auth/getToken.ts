import { privateProcedure } from "@admin/src/trpc";
import { prisma } from "@admin/prisma/client";

export const getToken = privateProcedure.query(async () => {
	const config = await prisma.token.findFirst();
	return config?.token;
});
