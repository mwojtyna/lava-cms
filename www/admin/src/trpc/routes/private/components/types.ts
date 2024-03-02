import { z } from "zod";
import {
	type ComponentDefinitionField,
	ComponentFieldTypeSchema,
	ArrayItemTypeSchema,
} from "@/prisma/generated/zod";
import { systemNameRegex } from "@/src/utils/regex";

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

export const fieldDefSchema = z.object({
	name: z.string().regex(systemNameRegex),
	displayName: z.string(),
	type: ComponentFieldTypeSchema,
	arrayItemType: ArrayItemTypeSchema.nullable(),
	order: z.number(),
});
