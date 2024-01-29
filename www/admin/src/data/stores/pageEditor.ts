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
	diff: Diff;
}
type ArrayItemGroups = Record<string, ArrayItemUI[]>;

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

	originalArrayItems: ArrayItemGroups;
	arrayItems: ArrayItemGroups;
	setArrayItems: (parentFieldId: string, arrayItems: ArrayItemUI[]) => void;

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

	originalArrayItems: {},
	arrayItems: {},
	setArrayItems: (parentFieldId, newArrayItems) =>
		set((state) => {
			for (const ai of newArrayItems) {
				if (ai.diff === "edited" || ai.diff === "reordered") {
					const original = state.originalArrayItems[parentFieldId]!.find(
						(oc) => oc.id === ai.id,
					)!;

					if (areSame(original, ai)) {
						ai.diff = "none";
					}
				}
			}
			let arrayItems: ArrayItemGroups = {
				...state.arrayItems,
				[parentFieldId]: newArrayItems,
			};
			if (Object.values(arrayItems).flat().length === 0) {
				arrayItems = {};
			}

			return {
				arrayItems,
				isDirty:
					JSON.stringify(state.originalComponents) !== JSON.stringify(state.components) ||
					JSON.stringify(state.originalNestedComponents) !==
						JSON.stringify(state.nestedComponents) ||
					JSON.stringify(state.originalArrayItems) !== JSON.stringify(arrayItems),
			};
		}),

	steps: [{ name: "components" }],
	setSteps: (steps) => set({ steps }),

	init: (components, nestedComponents, arrayItems) => {
		// Group array items by parent
		const arrayItemsGrouped: ArrayItemGroups = {};
		for (const item of arrayItems) {
			const items = arrayItemsGrouped[item.parentFieldId] ?? [];
			if (item.diff !== "deleted") {
				items.push(item);
			}
			arrayItemsGrouped[item.parentFieldId] = items;
		}
		for (const parentId of Object.keys(arrayItemsGrouped)) {
			let i = 0;
			for (const item of arrayItemsGrouped[parentId]!) {
				if (item.order !== i) {
					item.diff = "reordered";
					item.order = i;
				}
				i++;
			}
		}

		set({
			components,
			originalComponents: components,

			nestedComponents,
			originalNestedComponents: nestedComponents,

			arrayItems: arrayItemsGrouped,
			originalArrayItems: structuredClone(arrayItemsGrouped),

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
				arrayItems: structuredClone(state.originalArrayItems),
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
			const correctedOrderItems: ArrayItemGroups = structuredClone(state.arrayItems);
			for (const parentId of Object.keys(correctedOrderItems)) {
				correctedOrderItems[parentId] = correctedOrderItems[parentId]!.filter(
					(item) => item.diff !== "deleted",
				);

				let i = 0;
				for (const item of correctedOrderItems[parentId]!) {
					if (item.order !== i) {
						item.diff = "reordered";
						item.order = i;
					}
					i++;
				}
			}

			const flattenedItems = Object.values(state.arrayItems).flat();

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

					addedArrayItems: flattenedItems
						.filter((item) => item.diff === "added")
						.map((item) => ({
							frontendId: item.id,
							data: item.data,
							parentFieldId: item.parentFieldId,
							order: item.order,
						})),
					editedArrayItems: Object.values(correctedOrderItems)
						.flat()
						.filter(
							(item) =>
								item.diff === "edited" ||
								item.diff === "reordered" ||
								// 'replaced' is for when the item is of type COMPONENT, see ArrayFieldItem handleChange() function
								item.diff === "replaced",
						),
					deletedArrayItemIds: flattenedItems
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
