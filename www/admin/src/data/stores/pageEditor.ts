import { create } from "zustand";
import type { Component } from "@/app/(editor)/dashboard/pages/editor/[pageId]/types";
import type { trpc } from "@/src/utils/trpc";
import "client-only";

type Diff = "added" | "edited" | "deleted";
export interface ComponentUI extends Component {
	diffs: Diff[];
}

interface PageEditorState {
	isDirty: boolean;
	isValid: boolean;
	setIsValid: (isValid: boolean) => void;

	originalComponents: ComponentUI[];
	components: ComponentUI[];

	init: (components: ComponentUI[]) => void;
	setComponents: (components: ComponentUI[]) => void;
	save: (
		mutation: ReturnType<typeof trpc.pages.editPageComponents.useMutation>,
		pageId: string,
	) => void;
}
export const usePageEditor = create<PageEditorState>((set) => ({
	isDirty: false,
	isValid: true,
	setIsValid: (isValid) => set({ isValid }),

	originalComponents: [],
	components: [],

	init: (components) =>
		set({
			originalComponents: components,
			components: components,
			isDirty: false,
		}),
	setComponents: (changedComponents) =>
		set((state) => {
			for (const comp of changedComponents) {
				if (comp.diffs.at(-1) === "edited") {
					const original = state.originalComponents.find((c) => c.id === comp.id)!;
					if (areSame(original, comp)) {
						comp.diffs = [];
					}
				}
			}

			return {
				components: changedComponents,
				isDirty:
					JSON.stringify(state.originalComponents) !== JSON.stringify(changedComponents),
			};
		}),
	save: (mutation, pageId) =>
		set((state) => {
			mutation.mutate({
				pageId,
				editedComponents: state.components.filter((comp) => comp.diffs.at(-1) === "edited"),
			});
			return state;
		}),
}));

function areSame(original: ComponentUI, current: ComponentUI) {
	const a = { ...original, diffs: undefined };
	const b = { ...current, diffs: undefined };
	return JSON.stringify(a) === JSON.stringify(b);
}
