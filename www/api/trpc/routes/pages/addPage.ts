import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";
import { url } from "@api/trpc/regex";

export const addPage = publicProcedure
	.input(
		z.object({
			name: z.string(),
			url: z.string().regex(url),
			parent_id: z.string().cuid().nullable(),
			is_group: z.boolean().optional(),
		})
	)
	.mutation(async ({ input }) => {
		if (await prisma.page.findFirst({ where: { url: input.url } })) {
			throw new TRPCError({
				code: "CONFLICT",
			});
		}

		const page = await prisma.page.create({
			data: {
				name: input.name,
				url: input.url,
				parent_id:
					input.parent_id === undefined
						? (await prisma.page.findFirst({ where: { parent_id: null } }))!.id
						: input.parent_id,
				is_group: input.is_group ?? false,
			},
		});
		return page.id;
	});
