import { create } from "zustand";
import type {
	Component,
	IframeMessage,
} from "@/app/(editor)/dashboard/pages/editor/[pageId]/types";
import type { trpc } from "@/src/utils/trpc";
import "client-only";

export type Diff = "added" | "edited" | "deleted" | "reordered" | "none";
export interface ComponentUI extends Component {
	diff: Diff;
}

type Step =
	| {
			name: "components";
	  }
	| {
			name: "edit-component";
			componentId: string;
	  }
	| {
			name: "edit-nested-component";
	  };

interface PageEditorState {
	isDirty: boolean;
	iframe: HTMLIFrameElement | null;
	iframeOrigin: string;

	isValid: boolean;
	setIsValid: (isValid: boolean) => void;

	originalComponents: ComponentUI[];
	components: ComponentUI[];
	setComponents: (components: ComponentUI[]) => void;

	originalNestedComponents: ComponentUI[];
	nestedComponents: ComponentUI[];
	setNestedComponents: (components: ComponentUI[]) => void;

	steps: Step[];
	setSteps: (steps: Step[]) => void;

	init: (components: ComponentUI[]) => void;
	reset: () => void;
	save: (
		mutation: ReturnType<typeof trpc.pages.editPageComponents.useMutation>,
		pageId: string,
	) => void;
}
export const usePageEditor = create<PageEditorState>((set) => ({
	isDirty: false,

	isValid: true,
	setIsValid: (isValid) => set({ isValid }),

	iframe: null,
	iframeOrigin: "",

	originalComponents: [],
	components: [],
	setComponents: (newComponents) =>
		set((state) => {
			for (const nc of newComponents) {
				const original = state.originalComponents.find((oc) => oc.id === nc.id)!;
				if (nc.diff === "edited" || nc.diff === "reordered") {
					if (areSame(original, nc)) {
						nc.diff = "none";
					}
				}
			}

			return {
				components: newComponents,
				isDirty: JSON.stringify(state.originalComponents) !== JSON.stringify(newComponents),
			};
		}),

	originalNestedComponents: [],
	nestedComponents: [],
	setNestedComponents: () => false,

	steps: [{ name: "components" }],
	setSteps: (steps) => set({ steps }),

	init: (components) => {
		set(() => {
			return {
				components,
				originalComponents: components,
				isDirty: false,
			};
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
						(comp) => comp.id === lastStep.componentId,
					);
					if (!original) {
						steps = getLastValidStep(steps.slice(0, -1));
					}
				} else if (lastStep.name === "edit-nested-component") {
					// TODO: Equivalent for nested components
				}

				return steps;
			}

			return {
				components: state.originalComponents,
				nestedComponents: state.originalNestedComponents,
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
							frontendId: comp.id,
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
					// `fidToBid` is a map of frontend ids to backend ids
					onSuccess: (fidToBid) => {
						state.iframe!.contentWindow!.postMessage(
							{ name: "update" } as IframeMessage,
							state.iframeOrigin,
						);

						// Update ids on steps
						state.setSteps(
							state.steps.map((step) => {
								if (
									step.name === "edit-component" &&
									step.componentId in fidToBid
								) {
									return {
										...step,
										componentId: fidToBid[step.componentId]!,
									};
								} else {
									return step;
								}
							}),
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
