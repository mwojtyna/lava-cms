import { publicProcedure } from "@admin/src/trpc";
import { prisma } from "@admin/prisma/client";

export const setupRequired = publicProcedure.query(
	async (): Promise<{ reason: "no-user" | "no-config" | null }> => {
		const user = await prisma.authUser.findFirst();
		const config = await prisma.config.findFirst();

		if (!user) {
			return { reason: "no-user" as const };
		}
		if (!config) {
			return { reason: "no-config" as const };
		}
		return { reason: null };
	}
);
