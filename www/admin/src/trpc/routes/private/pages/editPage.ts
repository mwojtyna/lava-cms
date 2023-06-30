import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@admin/prisma/client";
import { publicProcedure } from "@admin/src/trpc";
import { urlRegex } from "@admin/src/trpc/regex";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const editPage = publicProcedure
	.input(
		z.object({
			id: z.string().cuid(),
			newName: z.string(),
			newUrl: z.string().regex(urlRegex),
		})
	)
	.mutation(async ({ input }) => {
		const page = await prisma.page.findFirst({
			where: { id: input.id },
		});

		if (!page) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}

		try {
			await prisma.$transaction([
				prisma.page.update({
					where: { id: input.id },
					data: {
						name: input.newName,
						url: input.newUrl,
						last_update: new Date(),
					},
				}),
				prisma.$executeRaw`UPDATE frontend.page SET "url" = REPLACE("url", ${page.url} || '/', ${input.newUrl} || '/'), "last_update" = Now() WHERE "url" LIKE ${page.url} || '/%';`,
			]);
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new TRPCError({ code: "CONFLICT" });
				}
			} else throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
		}
	});
