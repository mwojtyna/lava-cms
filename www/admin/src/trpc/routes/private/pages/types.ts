import { z } from "zod";

const fieldSchema = z.object({
	id: z.string(),
	name: z.string(),
	data: z.string(),
	type: z.string(),
});

export const componentSchema = z.object({
	id: z.string(),
	name: z.string(),
	definitionName: z.string(),
	order: z.number(),
	fields: z.array(fieldSchema),
});
export type Component = z.infer<typeof componentSchema>;
