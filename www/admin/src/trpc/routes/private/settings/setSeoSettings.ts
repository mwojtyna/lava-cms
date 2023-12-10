import { TRPCError } from "@trpc/server";
import tags from "language-tags";
import { z } from "zod";
import { prisma } from "@admin/prisma/client";
import { privateProcedure } from "@admin/src/trpc";

export const setSeoSettings = privateProcedure
	.input(
		z.object({
			title: z.string(),
			description: z.string(),
			language: z.string(),
		}),
	)
	.mutation(async ({ input }) => {
		if (!tags.check(input.language)) {
			throw new TRPCError({ code: "BAD_REQUEST" });
		}

		const settings = await prisma.settingsSeo.findFirst();
		await prisma.settingsSeo.upsert({
			where: {
				id: settings?.id ?? "",
			},
			create: {
				title: input.title,
				description: input.description,
				language: input.language,
			},
			update: {
				title: input.title,
				description: input.description,
				language: input.language,
			},
		});
	});
