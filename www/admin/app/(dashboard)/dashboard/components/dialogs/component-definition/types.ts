import type { ComponentsTableComponentDef } from "../../ComponentsTable";
import { z } from "zod";
import { ComponentFieldTypeSchema, ArrayItemTypeSchema } from "@/prisma/generated/zod";
import { systemNameRegex } from "@/src/utils/regex";

export const fieldDefinitionUISchema = z.object({
	id: z.string().cuid(),
	name: z
		.string()
		.regex(/^[a-zA-Z]/, { message: "The first character must be a letter." })
		.regex(systemNameRegex, { message: "Only numbers, letters, and underscores allowed." })
		.min(1, { message: " " }),
	displayName: z.string().min(1, { message: " " }),
	type: ComponentFieldTypeSchema,
	arrayItemType: ArrayItemTypeSchema.nullable(),
	order: z.number(),
	diff: z.union([
		z.literal("none"),
		z.literal("added"),
		z.literal("deleted"),
		z.literal("edited"),
	]),
	reordered: z.boolean(),
});
export type FieldDefinitionUI = z.infer<typeof fieldDefinitionUISchema>;

export type DialogType = "add" | "edit";
export type Step =
	| {
			name: "component-definition";
			componentDef: ComponentsTableComponentDef;
	  }
	| {
			name: "field-definition";
			fieldDef: FieldDefinitionUI;
	  };
