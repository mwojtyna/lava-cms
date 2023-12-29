import { create } from "zustand";
import type {
	Component,
	IframeMessage,
} from "@/app/(editor)/dashboard/pages/editor/[pageId]/types";
import type { ComponentFieldTypeType } from "@/prisma/generated/zod";
import type { trpc } from "@/src/utils/trpc";
import "client-only";

export type Diff = "added" | "edited" | "deleted" | "reordered" | "none";
export interface ComponentUI extends Component {
	diff: Diff;
}
export interface NestedComponentUI {
	name: string;
	fields: Array<{
		name: string;
		data: string;
		type: ComponentFieldTypeType;
	}>;
}

type Step =
	| {
			name: "components";
	  }
	| {
			name: "edit-component";
			// Don't use id, because when adding a new component the id is not known yet and it leads to errors
			componentIndex: number;
	  }
	| {
			name: "edit-nested-component";
			nestedComponent: NestedComponentUI;
			/** @param value - `CmsComponent` as JSON  */
			onChange: (value: string) => void;
	  };

interface PageEditorState {
	isDirty: boolean;
	iframe: HTMLIFrameElement | null;
	iframeOrigin: string;

	isValid: boolean;
	setIsValid: (isValid: boolean) => void;

	originalComponents: ComponentUI[];
	components: ComponentUI[];

	steps: Step[];
	setSteps: (steps: Step[]) => void;

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

	iframe: null,
	iframeOrigin: "",

	originalComponents: [],
	components: [],
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

	steps: [{ name: "components" }],
	setSteps: (steps) => set({ steps }),

	init: (components) => {
		set({
			originalComponents: components,
			components: components,
			isDirty: false,
		});
	},
	reset: () =>
		set((state) => {
			// Get last step which has a defined component
			// Useful for resetting when current step is a component which was just added
			function getLastValidStep(steps: Step[]) {
				const lastStep = steps.at(-1)!;
				if (lastStep.name === "edit-component") {
					const original = state.originalComponents.find(
						(comp) => comp.order === lastStep.componentIndex,
					);
					if (!original) {
						steps = getLastValidStep(steps.slice(0, -1));
					}
				}

				return steps;
			}

			return {
				components: state.originalComponents,
				isDirty: false,
				steps: getLastValidStep(state.steps),
			};
		}),
	save: (mutation, pageId) =>
		set((state) => {
			mutation.mutate(
				{
					pageId,
					addedComponents: state.components
						.filter((comp) => comp.diff === "added")
						.map((comp) => ({
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
				},
				{
					onSuccess: () => {
						state.iframe!.contentWindow!.postMessage(
							{ name: "update" } as IframeMessage,
							state.iframeOrigin,
						);
					},
				},
			);

			return state;
		}),
}));

function areSame(original: ComponentUI, current: ComponentUI) {
	const a = { ...original, diff: undefined };
	const b = { ...current, diff: undefined };
	return JSON.stringify(a) === JSON.stringify(b);
}
