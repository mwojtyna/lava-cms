import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";

export const getToken = privateProcedure.query(async () => {
	const res = await prisma.settingsConnection.findFirst();
	return res?.token;
});
