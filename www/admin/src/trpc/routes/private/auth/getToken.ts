import { privateProcedure } from "@admin/src/trpc";
import { prisma } from "@admin/prisma/client";

export const getToken = privateProcedure.query(async () => {
	const res = await prisma.settingsConnection.findFirst();
	return res?.token;
});
