import { prisma } from "@admin/prisma/client";
import { privateProcedure } from "@admin/src/trpc";

export const getConnectionSettings = privateProcedure.query(async () => {
	const settings = await prisma.settingsConnection.findFirstOrThrow();
	const { id, token, ...rest } = settings;

	return {
		developmentUrl: rest.development_url,
	};
});
