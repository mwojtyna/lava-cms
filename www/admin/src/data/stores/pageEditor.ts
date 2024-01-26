import { create } from "zustand";
import type {
	Component,
	IframeMessage,
} from "@/app/(editor)/dashboard/pages/editor/[pageId]/types";
import type { ArrayItem } from "@/src/trpc/routes/private/pages/types";
import type { trpc } from "@/src/utils/trpc";
import "client-only";

export type Diff = "added" | "edited" | "deleted" | "reordered" | "replaced" | "none";

export interface ComponentUI extends Component {
	diff: Diff;
}
export type FieldUI = ComponentUI["fields"][number];
export interface ArrayItemUI extends ArrayItem {
	diff: Exclude<Diff, "replaced">;
}

export type Step =
	| {
			name: "components";
	  }
	| {
			name: "edit-component";
			componentId: string;
	  }
	| {
			name: "edit-nested-component";
			nestedComponentId: string;
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

	originalArrayItems: ArrayItemUI[];
	arrayItems: ArrayItemUI[];
	setArrayItems: (arrayItems: ArrayItemUI[]) => void;

	steps: Step[];
	setSteps: (steps: Step[]) => void;

	init: (
		components: ComponentUI[],
		nestedComponents: ComponentUI[],
		arrayItems: ArrayItemUI[],
	) => void;
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
				if (nc.diff === "edited" || nc.diff === "reordered") {
					const original = state.originalComponents.find((oc) => oc.id === nc.id)!;
					if (areSame(original, nc)) {
						nc.diff = "none";
					}
				}
			}

			return {
				components: newComponents,
				isDirty:
					JSON.stringify(state.originalComponents) !== JSON.stringify(newComponents) ||
					JSON.stringify(state.originalNestedComponents) !==
						JSON.stringify(state.nestedComponents) ||
					JSON.stringify(state.originalArrayItems) !== JSON.stringify(state.arrayItems),
			};
		}),

	originalNestedComponents: [],
	nestedComponents: [],
	setNestedComponents: (newNestedComponents) =>
		set((state) => {
			for (const nc of newNestedComponents) {
				if (nc.diff === "edited" || nc.diff === "reordered") {
					const original = state.originalNestedComponents.find((oc) => oc.id === nc.id)!;
					if (areSame(original, nc)) {
						nc.diff = "none";
					}
				}
			}

			return {
				nestedComponents: newNestedComponents,
				isDirty:
					JSON.stringify(state.originalComponents) !== JSON.stringify(state.components) ||
					JSON.stringify(state.originalNestedComponents) !==
						JSON.stringify(newNestedComponents) ||
					JSON.stringify(state.originalArrayItems) !== JSON.stringify(state.arrayItems),
			};
		}),

	originalArrayItems: [],
	arrayItems: [],
	setArrayItems: (newArrayItems) =>
		set((state) => {
			for (const ai of newArrayItems) {
				if (ai.diff === "edited") {
					const original = state.originalArrayItems.find((oc) => oc.id === ai.id)!;
					if (areSame(original, ai)) {
						ai.diff = "none";
					}
				}
			}

			return {
				arrayItems: newArrayItems,
				isDirty:
					JSON.stringify(state.originalComponents) !== JSON.stringify(state.components) ||
					JSON.stringify(state.originalNestedComponents) !==
						JSON.stringify(state.nestedComponents) ||
					JSON.stringify(state.originalArrayItems) !== JSON.stringify(newArrayItems),
			};
		}),

	steps: [{ name: "components" }],
	setSteps: (steps) => set({ steps }),

	init: (components, nestedComponents, arrayItems) => {
		set({
			components,
			originalComponents: components,

			nestedComponents,
			originalNestedComponents: nestedComponents,

			arrayItems,
			originalArrayItems: arrayItems,

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
						(comp) => comp.id === lastStep.componentId,
					);
					if (!original) {
						steps = getLastValidStep(steps.slice(0, -1));
					}
				} else if (lastStep.name === "edit-nested-component") {
					const original = state.originalNestedComponents.find(
						(comp) => comp.id === lastStep.nestedComponentId,
					);
					if (!original) {
						steps = getLastValidStep(steps.slice(0, -1));
					}
				}
				return steps;
			}

			return {
				components: state.originalComponents,
				nestedComponents: state.originalNestedComponents,
				arrayItems: state.originalArrayItems,
				isDirty: false,
				steps: getLastValidStep(state.steps),
			};
		}),
	save: (mutation, pageId) =>
		set((state) => {
			// Fix component order
			const correctedOrderComponents = state.components
				.filter((comp) => comp.diff !== "deleted")
				.map((comp, i) => ({
					...comp,
					order: i,
					diff: comp.order !== i ? "reordered" : comp.diff,
				}));

			// Fix array item order
			const groupedByParent: Map<string, ArrayItemUI[]> = new Map<string, ArrayItemUI[]>();
			for (const item of state.arrayItems) {
				const items = groupedByParent.get(item.parentFieldId) ?? [];
				if (item.diff !== "deleted") {
					items.push(item);
				}
				groupedByParent.set(item.parentFieldId, items);
			}
			for (const parentId of groupedByParent.keys()) {
				let i = 0;
				for (const item of groupedByParent.get(parentId)!) {
					if (item.order !== i) {
						item.diff = "reordered";
						item.order = i;
					}
					i++;
				}
			}

			const correctedOrderArrayItems: ArrayItemUI[] = [];
			for (const item of groupedByParent.values()) {
				correctedOrderArrayItems.push(...item);
			}

			mutation.mutate(
				{
					pageId,
					addedComponents: state.components
						.concat(state.nestedComponents)
						.filter((comp) => comp.diff === "added" || comp.diff === "replaced")
						.map((comp) => ({
							pageId,
							parentComponentId: comp.parentComponentId,
							frontendId: comp.id,
							definition: comp.definition,
							order: comp.order,
							fields: comp.fields.map((field) => ({
								frontendId: field.id,
								data: field.data,
								definitionId: field.definitionId,
							})),
						})),
					editedComponents: correctedOrderComponents
						.concat(state.nestedComponents)
						.filter((comp) => comp.diff === "edited" || comp.diff === "reordered"),
					deletedComponentIds: state.components
						.concat(state.nestedComponents)
						// Replaced components have the same id as the original
						.filter((comp) => comp.diff === "deleted" || comp.diff === "replaced")
						.map((comp) => comp.id),

					addedArrayItems: state.arrayItems
						.filter((item) => item.diff === "added")
						.map((item) => ({
							frontendId: item.id,
							data: item.data,
							parentFieldId: item.parentFieldId,
							order: item.order,
						})),
					editedArrayItems: correctedOrderArrayItems.filter(
						(item) => item.diff === "edited" || item.diff === "reordered",
					),
					deletedArrayItemIds: state.arrayItems
						.filter((item) => item.diff === "deleted")
						.map((item) => item.id),
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
								switch (step.name) {
									case "edit-component": {
										if (step.componentId in fidToBid) {
											return {
												...step,
												componentId: fidToBid[step.componentId]!,
											};
										}
										break;
									}
									case "edit-nested-component": {
										if (step.nestedComponentId in fidToBid) {
											return {
												...step,
												nestedComponentId:
													fidToBid[step.nestedComponentId]!,
											};
										}
										break;
									}
								}
								// Can't use in default case because typescript is dumb
								return step;
							}),
						);
					},
				},
			);

			return state;
		}),
}));

function areSame<T extends { diff: Diff }>(original: T, current: T) {
	const a = { ...original, diff: undefined };
	const b = { ...current, diff: undefined };
	return JSON.stringify(a) === JSON.stringify(b);
}
