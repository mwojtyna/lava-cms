import { z } from "zod";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";

export const setConnectionSettings = privateProcedure
	.input(
		z.object({
			developmentUrl: z.string().endsWith("/"),
		}),
	)
	.mutation(async ({ input }) => {
		const settings = await prisma.settingsConnection.findFirst();
		await prisma.settingsConnection.update({
			where: {
				id: settings?.id ?? "",
			},
			data: {
				development_url: input.developmentUrl,
			},
		});
	});
