import { create } from "zustand";
import type { Component } from "@/app/(editor)/dashboard/pages/editor/[pageId]/types";
import "client-only";

interface PageEditorState {
	isDirty: boolean;
	originalComponents: Component[];
	currentComponents: Component[];

	init: (components: Component[]) => void;
	setComponents: (components: Component[]) => void;
}
export const usePageEditor = create<PageEditorState>((set) => ({
	isDirty: false,
	originalComponents: [],
	currentComponents: [],

	init: (components) =>
		set({
			originalComponents: components,
			currentComponents: components,
		}),
	setComponents: (newComponents) =>
		set((prev) => {
			const isDirty =
				JSON.stringify(newComponents) !== JSON.stringify(prev.originalComponents);
			return {
				currentComponents: newComponents,
				isDirty,
			};
		}),
}));
