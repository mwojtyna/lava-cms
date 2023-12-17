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
	originalComponents: ComponentUI[];
	currentComponents: ComponentUI[];

	init: (components: ComponentUI[]) => void;
	setComponents: (components: ComponentUI[]) => void;
	save: (
		mutation: ReturnType<typeof trpc.pages.editPageComponents.useMutation>,
		pageId: string,
	) => void;
}
export const usePageEditor = create<PageEditorState>((set) => ({
	isDirty: false,
	originalComponents: [],
	currentComponents: [],

	init: (components) =>
		set({
			originalComponents: components,
			currentComponents: components,
			isDirty: false,
		}),
	setComponents: (components) =>
		set((state) => {
			for (const comp of components) {
				if (comp.diffs.at(-1) === "edited") {
					const original = state.originalComponents.find((c) => c.id === comp.id)!;
					if (areSame(original, comp)) {
						comp.diffs = [];
					}
				}
			}

			return {
				currentComponents: components,
				isDirty: JSON.stringify(state.originalComponents) !== JSON.stringify(components),
			};
		}),
	save: (mutation, pageId) =>
		set((state) => {
			mutation.mutate({
				pageId,
				editedComponents: state.currentComponents.filter(
					(comp) => comp.diffs.at(-1) === "edited",
				),
			});
			return state;
		}),
}));

function areSame(original: ComponentUI, current: ComponentUI) {
	const a = { ...original, diffs: undefined };
	const b = { ...current, diffs: undefined };
	return JSON.stringify(a) === JSON.stringify(b);
}
