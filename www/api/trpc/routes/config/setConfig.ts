import { publicProcedure } from "@api/trpc";
import { z } from "zod";
import { prisma } from "@api/prisma/client";
import tags from "language-tags";
import { TRPCError } from "@trpc/server";

export const setConfig = publicProcedure
	.input(
		z.object({
			title: z.string(),
			description: z.string(),
			language: z.string(),
		})
	)
	.mutation(async ({ input }) => {
		if (!tags.check(input.language)) {
			throw new TRPCError({ code: "BAD_REQUEST" });
		}

		const config = await prisma.config.findFirst();
		await prisma.config.upsert({
			where: {
				id: config?.id ?? "",
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
