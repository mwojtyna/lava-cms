import { privateProcedure } from "@admin/src/trpc";
import { prisma } from "@admin/prisma/client";

export const getSeoSettings = privateProcedure.query(async () => {
	const settings = await prisma.settingsSeo.findFirstOrThrow();
	const { id, ...rest } = settings;

	return rest;
});
