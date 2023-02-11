import { publicProcedure } from "..";
import { z } from "zod";

export const greeting = publicProcedure
	.input(
		z.object({
			name: z.string(),
		})
	)
	.query(({ input }) => {
		return {
			greeting: "Hello " + input?.name,
		};
	});
