import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";
import { urlRegex } from "@api/trpc/regex";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const addPage = publicProcedure
	.input(
		z.object({
			name: z.string(),
			url: z.string().regex(urlRegex),
			parent_id: z.string().cuid().nullable(),
			is_group: z.boolean(),
		})
	)
	.mutation(async ({ input }): Promise<string | undefined> => {
		try {
			const page = await prisma.page.create({
				data: {
					name: input.name,
					url: input.url,
					parent_id: input.parent_id,
					is_group: input.is_group,
				},
			});
			return page.id;
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new TRPCError({ code: "CONFLICT" });
				}
			} else throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
		}
	});
