import { create } from "zustand";
import type { Component } from "@/app/(editor)/dashboard/pages/editor/[pageId]/types";
import type { trpc } from "@/src/utils/trpc";
import "client-only";

export type Diff = "added" | "edited" | "deleted" | "reordered" | "none";
export interface ComponentUI extends Component {
	diff: Diff;
}

interface PageEditorState {
	isDirty: boolean;
	isValid: boolean;
	setIsValid: (isValid: boolean) => void;

	originalComponents: ComponentUI[];
	components: ComponentUI[];

	init: (components: ComponentUI[]) => void;
	reset: () => void;
	save: (
		mutation: ReturnType<typeof trpc.pages.editPageComponents.useMutation>,
		pageId: string,
	) => void;
	setComponents: (components: ComponentUI[]) => void;
}
export const usePageEditor = create<PageEditorState>((set) => ({
	isDirty: false,
	isValid: true,
	setIsValid: (isValid) => set({ isValid }),

	originalComponents: [],
	components: [],

	init: (components) => {
		set({
			originalComponents: components,
			components: components,
			isDirty: false,
		});
	},
	reset: () =>
		set((state) => ({
			components: state.originalComponents,
			isDirty: false,
		})),
	save: (mutation, pageId) =>
		set((state) => {
			mutation.mutate({
				pageId,
				addedComponents: state.components
					.filter((comp) => comp.diff === "added")
					.map((comp) => ({
						name: comp.name,
						pageId,
						definition: comp.definition,
						order: comp.order,
						fields: comp.fields.map((field) => ({
							data: field.data,
							definitionId: field.definitionId,
						})),
					})),
				editedComponents: state.components.filter(
					(comp) => comp.diff === "edited" || comp.diff === "reordered",
				),
				deletedComponentIds: state.components
					.filter((comp) => comp.diff === "deleted")
					.map((comp) => comp.id),
			});
			return state;
		}),

	setComponents: (changedComponents) =>
		set((state) => {
			for (const comp of changedComponents) {
				const original = state.originalComponents.find((c) => c.id === comp.id)!;
				if (comp.diff === "edited" || comp.diff === "reordered") {
					if (areSame(original, comp)) {
						comp.diff = "none";
					}
				}
			}

			return {
				components: changedComponents,
				isDirty:
					JSON.stringify(state.originalComponents) !== JSON.stringify(changedComponents),
			};
		}),
}));

function areSame(original: ComponentUI, current: ComponentUI) {
	const a = { ...original, diff: undefined };
	const b = { ...current, diff: undefined };
	return JSON.stringify(a) === JSON.stringify(b);
}
