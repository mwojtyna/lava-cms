import { z } from "zod";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";
import { url } from "@api/trpc/regex";

export const addPage = publicProcedure
	.input(
		z.object({
			name: z.string(),
			url: z.string().regex(url),
			parent_id: z.string().cuid().optional(),
			order: z.number().int(),
		})
	)
	.mutation(async ({ input }) => {
		try {
			await prisma.page.create({
				data: {
					name: input.name,
					url: input.url,
					parent_id: input.parent_id ?? null,
					order: input.order,
				},
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				throw new TRPCError({
					code: "CONFLICT",
				});
			}
		}
	});
