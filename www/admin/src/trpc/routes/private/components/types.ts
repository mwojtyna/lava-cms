import {
	ComponentDefinitionFieldSchema,
	type ComponentDefinitionField,
	type ComponentInstance,
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

export const fieldSchema = ComponentDefinitionFieldSchema.pick({
	name: true,
	type: true,
	array_item_type: true,
	order: true,
});
