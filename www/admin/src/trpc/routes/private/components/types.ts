import { z } from "zod";
import {
	type ComponentDefinitionField,
	type ComponentInstance,
	ComponentFieldTypeSchema,
	ArrayItemTypeSchema,
} from "@/prisma/generated/zod";

export type GroupItem = {
	id: string;
	name: string;
	parentGroupId: string | null;
	lastUpdate: Date;
} & (
	| {
			isGroup: false;
			instances: ComponentInstance[];
			fieldDefinitions: ComponentDefinitionField[];
	  }
	| {
			isGroup: true;
	  }
);

export const fieldSchema = z.object({
	name: z.string(),
	type: ComponentFieldTypeSchema,
	arrayItemType: ArrayItemTypeSchema.nullable(),
	order: z.number(),
});
