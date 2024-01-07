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
			const fieldDefinitions: FieldDefinitionUI[] = item.isGroup
				? []
				: item.fieldDefinitions.map((fd) => ({
						id: fd.id,
						name: fd.name,
						type: fd.type,
						diff: "none",
				  }));

			return {
				item,
				fields: fieldDefinitions,
				originalFields: fieldDefinitions,
			};
		}),

	fields: [],
	originalFields: [],
	setFields: (fields) => set(() => ({ fields })),

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
