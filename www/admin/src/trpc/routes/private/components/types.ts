import { z } from "zod";
import {
	type ComponentDefinitionField,
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
			instances: {
				pageToInstance: Record<string, ComponentInstancePreview>;
				count: number;
			};
			fieldDefinitions: ComponentDefinitionField[];
	  }
	| {
			isGroup: true;
	  }
);
export type ComponentInstancePreview = {
	pageName: string;
	count: number;
};

export const fieldSchema = z.object({
	name: z.string(),
	type: ComponentFieldTypeSchema,
	arrayItemType: ArrayItemTypeSchema.nullable(),
	order: z.number(),
});
