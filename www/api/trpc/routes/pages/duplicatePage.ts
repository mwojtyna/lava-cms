import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";
import { urlRegex } from "@api/trpc/regex";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const duplicatePage = publicProcedure
	.input(
		z.object({
			pageId: z.string().cuid(),
			newName: z.string(),
			newUrl: z.string().regex(urlRegex),
			newParentId: z.string().cuid(),
		})
	)
	.mutation(async ({ input }) => {
		const page = (await prisma.page.findUnique({ where: { id: input.pageId } }))!;
		const { id, ...rest } = page;

		try {
			await prisma.page.create({
				data: {
					...rest,
					name: input.newName,
					url: input.newUrl,
					parent_id: input.newParentId,
					last_update: new Date(),
				},
			});
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new TRPCError({ code: "CONFLICT" });
				}
			}
		}
	});
