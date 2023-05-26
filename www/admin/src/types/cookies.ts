import { z } from "zod";

export const tableSortingSchema = z
	.object({
		id: z.string(),
		desc: z.boolean(),
	})
	.nullable();
