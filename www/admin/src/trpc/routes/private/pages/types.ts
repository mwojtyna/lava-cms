import { z } from "zod";
import { ArrayItemTypeSchema, ComponentFieldTypeSchema } from "@/prisma/generated/zod";

const fieldSchema = z.object({
	id: z.string().cuid(),
	name: z.string(),
	data: z.string(),
	serializedRichText: z.string().nullable(),
	type: ComponentFieldTypeSchema,
	arrayItemType: ArrayItemTypeSchema.nullable(),
	definitionId: z.string().cuid(),
	order: z.number(),
});
export const componentSchema = z.object({
	id: z.string().cuid(),
	definition: z.object({
		id: z.string().cuid(),
		name: z.string(),
	}),
	pageId: z.string().cuid(),
	parentFieldId: z.string().cuid().nullable(),
	parentArrayItemId: z.string().cuid().nullable(),
	order: z.number(),
	fields: z.array(fieldSchema),
});

export const arrayItemSchema = z.object({
	id: z.string().cuid(),
	data: z.string(),
	parentFieldId: z.string().cuid(),
	order: z.number(),
});

export type Component = z.infer<typeof componentSchema>;
export type ArrayItem = z.infer<typeof arrayItemSchema>;
