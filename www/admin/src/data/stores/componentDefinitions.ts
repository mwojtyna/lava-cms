import { create } from "zustand";
import type { ComponentsTableItem } from "@/app/(dashboard)/dashboard/components/ComponentsTable";
import "client-only";
import type { FieldDefinitionUI } from "@/app/(dashboard)/dashboard/components/dialogs/component-definition/shared";

interface DialogState {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}
interface ComponentsTableDialogsState {
	item: ComponentsTableItem | null;
	setItem: (item: ComponentsTableItem) => void;

	isDirty: boolean;
	fields: FieldDefinitionUI[];
	originalFields: FieldDefinitionUI[];
	setFields: (fields: FieldDefinitionUI[]) => void;

	editComponentDefDialog: DialogState;
	editGroupDialog: DialogState;
	moveDialog: DialogState;
	duplicateDialog: DialogState;
	deleteDialog: DialogState;
}
export const useComponentsTableDialogs = create<ComponentsTableDialogsState>((set) => ({
	item: null,
	setItem: (item) =>
		set(() => {
			const fieldDefinitions: FieldDefinitionUI[] = !item.isGroup
				? item.fieldDefinitions.map((fd) => ({
						id: fd.id,
						name: fd.name,
						type: fd.type,
						order: fd.order,
						diff: "none",
				  }))
				: [];

			return {
				item,
				fields: fieldDefinitions,
				originalFields: fieldDefinitions,
				isDirty: false,
			};
		}),

	isDirty: false,
	fields: [],
	originalFields: [],
	setFields: (fields) =>
		set((state) => {
			for (const field of fields) {
				if (field.diff === "edited" || field.diff === "reordered") {
					const original = state.originalFields.find((of) => of.id === field.id)!;
					if (areSame(original, field)) {
						field.diff = "none";
					}
				}
			}

			return {
				fields,
				isDirty: JSON.stringify(state.originalFields) !== JSON.stringify(fields),
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
