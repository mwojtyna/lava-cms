import { create } from "zustand";
import type { Component } from "@/app/(editor)/dashboard/pages/editor/[pageId]/types";
import "client-only";
import type { trpc } from "@/src/utils/trpc";

export interface ComponentUI extends Component {
	diff: "added" | "edited" | "deleted" | "none";
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
		set((prev) => {
			const isDirty = JSON.stringify(components) !== JSON.stringify(prev.originalComponents);
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
