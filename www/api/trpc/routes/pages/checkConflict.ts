import { z } from "zod";
import { prisma } from "@api/prisma/client";
import { publicProcedure } from "@api/trpc";
import { url as urlRegex } from "@api/trpc/regex";

export const checkConflict = publicProcedure
	.input(
		z.object({
			newParentId: z.string().cuid(),
			originalUrls: z.array(z.string().regex(urlRegex)),
		})
	)
	.query(async ({ input }): Promise<{ conflict: boolean }> => {
		for (const newUrl of input.originalUrls) {
			const existingPage = await prisma.page.findFirst({
				where: {
					url: { endsWith: "/" + newUrl.split("/").pop() },
					parent_id: input.newParentId,
				},
			});

			if (existingPage) {
				return { conflict: true };
			}
		}

		return { conflict: false };
	});
