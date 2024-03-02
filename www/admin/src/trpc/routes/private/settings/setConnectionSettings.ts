import { z } from "zod";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";
import { devUrlRegex } from "@/src/utils/regex";

export const setConnectionSettings = privateProcedure
	.input(
		z.object({
			developmentUrl: z.string().regex(devUrlRegex).endsWith("/"),
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
