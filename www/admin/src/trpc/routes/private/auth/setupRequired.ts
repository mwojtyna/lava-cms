import { prisma } from "@admin/prisma/client";
import { privateProcedure } from "@admin/src/trpc";

export const setupRequired = privateProcedure
	.meta({ noAuth: true })
	.query(async (): Promise<{ reason: "no-user" | "no-config" | null }> => {
		const user = await prisma.adminUser.findFirst();
		const config = await prisma.settingsSeo.findFirst();

		if (!user) {
			return { reason: "no-user" };
		}
		if (!config) {
			return { reason: "no-config" };
		}
		return { reason: null };
	});
