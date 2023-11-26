import { privateProcedure } from "@admin/src/trpc";
import { prisma } from "@admin/prisma/client";

export const getConnectionSettings = privateProcedure.query(async () => {
	const settings = await prisma.settingsConnection.findFirstOrThrow();
	const { id, token, ...rest } = settings;

	return rest;
});
