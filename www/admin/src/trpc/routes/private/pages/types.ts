import { z } from "zod";
import { ArrayItemTypeSchema, ComponentFieldTypeSchema } from "@/prisma/generated/zod";

export const parentIdSchema = z.string().cuid2().or(z.string().cuid());

const fieldSchema = z.object({
	id: z.string().cuid(),
	name: z.string(),
	data: z.string(),
	richTextData: z.string().nullable(),
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
	parentComponentId: z.string().cuid().nullable(),
	order: z.number(),
	fields: z.array(fieldSchema),
});

export const arrayItemSchema = z.object({
	id: z.string().cuid(),
	data: z.string(),
	parentFieldId: parentIdSchema,
	order: z.number(),
});

export type Component = z.infer<typeof componentSchema>;
export type ArrayItem = z.infer<typeof arrayItemSchema>;
