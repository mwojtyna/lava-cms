import { privateProcedure } from "@admin/src/trpc";
import { z } from "zod";
import { prisma } from "@admin/prisma/client";

export const setConnectionSettings = privateProcedure
	.input(
		z.object({
			developmentUrl: z.string(),
		}),
	)
	.mutation(async ({ input }) => {
		const settings = await prisma.settingsConnection.findFirst();
		await prisma.settingsConnection.update({
			where: {
				id: settings?.id ?? "",
			},
			data: {
				developmentUrl: input.developmentUrl,
			},
		});
	});
