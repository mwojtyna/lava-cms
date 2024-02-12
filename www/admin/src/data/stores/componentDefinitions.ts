import { mountStoreDevtool } from "simple-zustand-devtools";
import { create } from "zustand";
import type { ComponentsTableItem } from "@/app/(dashboard)/dashboard/components/ComponentsTable";
import type { FieldDefinitionUI } from "@/app/(dashboard)/dashboard/components/dialogs/component-definition/shared";
import { env } from "@/src/env/client.mjs";
import { unwrapSetStateAction } from "./utils";
import "client-only";

interface DialogState {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}
interface ComponentsTableDialogsState {
	item: ComponentsTableItem | null;
	setItem: (item: ComponentsTableItem) => void;

	fieldsDirty: boolean;
	fields: FieldDefinitionUI[];
	originalFields: FieldDefinitionUI[];
	setFields: (fields: React.SetStateAction<FieldDefinitionUI[]>) => void;

	editComponentDefDialog: DialogState;
	editGroupDialog: DialogState;
	moveDialog: DialogState;
	duplicateDialog: DialogState;
	deleteDialog: DialogState;
}
const useComponentsTableDialogsStore = create<ComponentsTableDialogsState>((set) => ({
	item: null,
	setItem: (item) =>
		set(() => {
			const fieldDefinitions: FieldDefinitionUI[] = !item.isGroup
				? item.fieldDefinitions.map((fd) => ({
						id: fd.id,
						name: fd.name,
						type: fd.type,
						arrayItemType: fd.array_item_type,
						order: fd.order,
						diff: "none",
				  }))
				: [];

			return {
				item,
				fields: fieldDefinitions,
				originalFields: fieldDefinitions,
				fieldsDirty: false,
			};
		}),

	fieldsDirty: false,
	fields: [],
	originalFields: [],
	setFields: (fields) =>
		set((state) => {
			const newFields = unwrapSetStateAction(fields, state.fields);

			for (const field of newFields) {
				if (field.diff === "edited" || field.diff === "reordered") {
					const original = state.originalFields.find((of) => of.id === field.id)!;
					if (areSame(original, field)) {
						field.diff = "none";
					}
				}
			}

			return {
				fields: newFields,
				fieldsDirty: JSON.stringify(state.originalFields) !== JSON.stringify(newFields),
			};
		}),

	editComponentDefDialog: {
		isOpen: false,
		setIsOpen: (isOpen) =>
			set((state) => ({
				editComponentDefDialog: { ...state.editComponentDefDialog, isOpen },
			})),
	},
	editGroupDialog: {
		isOpen: false,
		setIsOpen: (isOpen) =>
			set((state) => ({ editGroupDialog: { ...state.editGroupDialog, isOpen } })),
	},
	moveDialog: {
		isOpen: false,
		setIsOpen: (isOpen) => set((state) => ({ moveDialog: { ...state.moveDialog, isOpen } })),
	},
	duplicateDialog: {
		isOpen: false,
		setIsOpen: (isOpen) =>
			set((state) => ({ duplicateDialog: { ...state.duplicateDialog, isOpen } })),
	},
	deleteDialog: {
		isOpen: false,
		setIsOpen: (isOpen) =>
			set((state) => ({ deleteDialog: { ...state.deleteDialog, isOpen } })),
	},
}));

function areSame(original: FieldDefinitionUI, current: FieldDefinitionUI) {
	const a = { ...original, diff: undefined };
	const b = { ...current, diff: undefined };
	return JSON.stringify(a) === JSON.stringify(b);
}

if (env.NEXT_PUBLIC_DEV) {
	mountStoreDevtool("ComponentDefinitionTableDialogsStore", useComponentsTableDialogsStore);
}

export { useComponentsTableDialogsStore };
