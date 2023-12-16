import { create } from "zustand";
import type { Component } from "@/app/(editor)/dashboard/pages/editor/[pageId]/types";
import "client-only";

export interface ComponentUI extends Component {
	diff: "added" | "edited" | "deleted" | "none";
}

interface PageEditorState {
	isDirty: boolean;
	originalComponents: ComponentUI[];
	currentComponents: ComponentUI[];

	init: (components: ComponentUI[]) => void;
	setComponents: (components: ComponentUI[]) => void;
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
}));
