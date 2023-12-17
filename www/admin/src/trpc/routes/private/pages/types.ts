import { z } from "zod";
import { ComponentFieldTypeSchema } from "@/prisma/generated/zod";

const fieldSchema = z.object({
	id: z.string(),
	name: z.string(),
	data: z.string(),
	type: ComponentFieldTypeSchema,
});

export const componentSchema = z.object({
	id: z.string(),
	name: z.string(),
	definitionName: z.string(),
	order: z.number(),
	fields: z.array(fieldSchema),
});
export type Component = z.infer<typeof componentSchema>;
