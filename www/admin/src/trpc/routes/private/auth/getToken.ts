import { prisma } from "@admin/prisma/client";
import { privateProcedure } from "@admin/src/trpc";

export const getToken = privateProcedure.query(async () => {
	const res = await prisma.settingsConnection.findFirst();
	return res?.token;
});
