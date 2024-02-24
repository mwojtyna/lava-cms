import { create } from "zustand";
import type { ComponentsTableItem } from "@/app/(dashboard)/dashboard/components/ComponentsTable";
import type { FieldDefinitionUI } from "@/app/(dashboard)/dashboard/components/dialogs/component-definition/shared";
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
						displayName: fd.display_name,
						type: fd.type,
						arrayItemType: fd.array_item_type ?? null,
						order: fd.order,
						diff: "none",
						reordered: false,
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

			for (let i = 0; i < newFields.length; i++) {
				const field = newFields[i]!;
				// Fix for when a component is added, reordered and then deleted
				// The components which were reordered still have the 'reordered' diff
				// but they are not reordered, because the added component was deleted
				field.order = i;

				if (field.diff === "edited" || (field.reordered && field.diff === "none")) {
					const original = state.originalFields.find((of) => of.id === field.id)!;
					if (areSame(original, field)) {
						field.diff = "none";
					}
					if (original.order === field.order) {
						field.reordered = false;
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
	const a: Partial<FieldDefinitionUI> = { ...original, diff: undefined, reordered: undefined };
	const b: Partial<FieldDefinitionUI> = { ...current, diff: undefined, reordered: undefined };
	return JSON.stringify(a) === JSON.stringify(b);
}

export { useComponentsTableDialogsStore };
