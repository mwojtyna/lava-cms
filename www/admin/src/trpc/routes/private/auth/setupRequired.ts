import { privateProcedure } from "@admin/src/trpc";
import { prisma } from "@admin/prisma/client";

export const setupRequired = privateProcedure
	.meta({ noAuth: true })
	.query(async (): Promise<{ reason: "no-user" | "no-config" | null }> => {
		const user = await prisma.user.findFirst();
		const config = await prisma.config.findFirst();

		if (!user) {
			return { reason: "no-user" };
		}
		if (!config) {
			return { reason: "no-config" };
		}
		return { reason: null };
	});
