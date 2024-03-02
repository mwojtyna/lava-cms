import { z } from "zod";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";
import { urlRegex } from "@/src/utils/regex";

type Conflicts =
	| {
			conflict: false;
	  }
	| {
			conflict: true;
			urls: string[];
	  };

export const checkConflict = privateProcedure
	.input(
		z.object({
			newParentId: z.string().cuid(),
			originalUrls: z.array(z.string().regex(urlRegex)),
		}),
	)
	.query(async ({ input }): Promise<Conflicts> => {
		const conflicts = [];

		for (const newUrl of input.originalUrls) {
			const existingPage = await prisma.page.findFirst({
				where: {
					url: { endsWith: "/" + newUrl.split("/").at(-1)! },
					parent_id: input.newParentId,
				},
			});

			if (existingPage) {
				conflicts.push(existingPage.url);
			}
		}

		if (conflicts.length > 0) {
			return { conflict: true, urls: conflicts };
		} else {
			return { conflict: false };
		}
	});
