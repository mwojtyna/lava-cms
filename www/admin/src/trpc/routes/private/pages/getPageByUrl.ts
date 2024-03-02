import { z } from "zod";
import { privateProcedure } from "@/src/trpc";
import { findPage } from "@/src/trpc/utils";

export const getPageByUrl = privateProcedure
	.input(
		z.object({
			url: z.string(),
		}),
	)
	.query(async ({ input }): Promise<{ id: string } | null> => {
		const page = await findPage(input.url);
		if (!page) {
			return null;
		}

		return {
			id: page.id,
		};
	});
