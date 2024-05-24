import type { Page } from "@prisma/client";
import { z } from "zod";
import { privateProcedure } from "@/src/trpc";
import { findPage } from "@/src/trpc/utils";

export const getPageByUrl = privateProcedure
	.input(
		z.object({
			url: z.string(),
		}),
	)
	.query(async ({ input }): Promise<Page | null> => {
		const page = await findPage(input.url);
		if (!page) {
			return null;
		}

		return page;
	});
