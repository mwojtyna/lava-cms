import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";
import { urlRegex } from "@/src/utils/regex";

export const addPage = privateProcedure
	.input(
		z.object({
			name: z.string(),
			url: z.string().regex(urlRegex),
			parentId: z.string().cuid().nullable(),
			isGroup: z.boolean(),
		}),
	)
	.mutation(async ({ input }): Promise<void> => {
		try {
			await prisma.page.create({
				data: {
					name: input.name,
					url: input.url,
					parent_id: input.parentId,
					is_group: input.isGroup,
				},
			});
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new TRPCError({ code: "CONFLICT" });
				} else {
					throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
				}
			} else {
				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
			}
		}
	});
