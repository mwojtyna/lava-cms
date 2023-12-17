import { create } from "zustand";
import type { Component } from "@/app/(editor)/dashboard/pages/editor/[pageId]/types";
import type { trpc } from "@/src/utils/trpc";
import "client-only";

export interface ComponentUI extends Component {
	diff: "added" | "edited" | "deleted";
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
			const isDirty = JSON.stringify(components) !== JSON.stringify(state.originalComponents);
			return {
				currentComponents: components,
				isDirty,
			};
		}),
	save: (mutation, pageId) =>
		set((state) => {
			mutation.mutate({
				pageId,
				editedComponents: state.currentComponents.filter((comp) => comp.diff === "edited"),
			});
			return state;
		}),
}));
