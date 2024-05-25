import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";

export const getConnectionSettings = privateProcedure.query(async () => {
	const { development_url } = await prisma.settingsConnection.findFirstOrThrow({
		select: { development_url: true },
	});

	return {
		developmentUrl: development_url,
	};
});
