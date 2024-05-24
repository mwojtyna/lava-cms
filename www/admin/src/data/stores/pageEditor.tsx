import type { inferRouterInputs } from "@trpc/server";
import { createPlateEditor, type Value } from "@udecode/plate-common";
import { serializeHtml } from "@udecode/plate-serializer-html";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { create } from "zustand";
import type {
	Component,
	PageEditorMessage,
} from "@/app/(editor)/dashboard/pages/editor/[pageId]/types";
import {
	plugins as richTextEditorPlugins,
	components as richTextEditorComponents,
} from "@/src/components/RichTextEditor";
import type { PrivateRouter } from "@/src/trpc/routes/private/_private";
import type { ArrayItem } from "@/src/trpc/routes/private/pages/types";
import type { trpc } from "@/src/utils/trpc";
import { unwrapSetStateAction } from "./utils";
import "client-only";

export type Diff = "added" | "deleted" | "replaced" | "none";
interface Editable {
	diff: Diff;
}

export type ComponentUI = Component & Editable;
export type FieldUI = ComponentUI["fields"][number];
export type ArrayItemUI = ArrayItem & Editable;
type ArrayItemsGrouped = Record<string, ArrayItemUI[]>;

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
	isTyping: boolean;
	setIsTyping: (value: boolean) => void;
	isSaving: boolean;
	setIsSaving: (value: boolean) => void;

	iframe: HTMLIFrameElement | null;
	iframeOrigin: string;

	originalComponents: ComponentUI[];
	components: ComponentUI[];
	setComponents: (newComponents: React.SetStateAction<ComponentUI[]>) => void;

	originalNestedComponents: ComponentUI[];
	nestedComponents: ComponentUI[];
	setNestedComponents: (newComponents: React.SetStateAction<ComponentUI[]>) => void;

	originalArrayItems: ArrayItemsGrouped;
	arrayItems: ArrayItemsGrouped;
	setArrayItems: (parentFieldId: string, arrayItems: React.SetStateAction<ArrayItemUI[]>) => void;

	steps: Step[];
	setSteps: (newSteps: React.SetStateAction<Step[]>) => void;

	init: (
		components: ComponentUI[],
		nestedComponents: ComponentUI[],
		arrayItems: ArrayItemUI[],
	) => void;
	isInitialized: boolean;

	reset: () => void;
	onReset: (() => void) | null;

	save: (
		mutation: ReturnType<typeof trpc.pages.editPageComponents.useMutation>,
		pageId: string,
	) => void;
}
export const usePageEditorStore = create<PageEditorState>((set) => ({
	isDirty: false,
	isTyping: false,
	setIsTyping: (value) => set({ isTyping: value }),
	isSaving: false,
	setIsSaving: (value) => set({ isSaving: value }),

	iframe: null,
	iframeOrigin: "",

	originalComponents: [],
	components: [],
	setComponents: (components) =>
		set((state) => {
			const newComponents = unwrapSetStateAction(components, state.components);

			for (let i = 0; i < newComponents.length; i++) {
				const nc = newComponents[i]!;
				// Fix for when a component is added, reordered and then deleted
				// The components which were reordered still have the 'reordered' diff
				// but they are not reordered, because the added component was deleted
				nc.order = i;
			}

			return {
				components: newComponents,
				isDirty:
					JSON.stringify(state.originalComponents) !==
						JSON.stringify(newComponents.filter((nc) => !isDeleted(nc))) ||
					JSON.stringify(state.originalNestedComponents) !==
						JSON.stringify(state.nestedComponents) ||
					JSON.stringify(state.originalArrayItems) !== JSON.stringify(state.arrayItems),
			};
		}),

	originalNestedComponents: [],
	nestedComponents: [],
	setNestedComponents: (components) =>
		set((state) => {
			const newNestedComponents = unwrapSetStateAction(components, state.nestedComponents);
			return {
				nestedComponents: newNestedComponents,
				isDirty:
					JSON.stringify(state.originalComponents) !== JSON.stringify(state.components) ||
					JSON.stringify(state.originalNestedComponents) !==
						JSON.stringify(newNestedComponents.filter((nc) => !isDeleted(nc))) ||
					JSON.stringify(state.originalArrayItems) !== JSON.stringify(state.arrayItems),
			};
		}),

	originalArrayItems: {},
	arrayItems: {},
	setArrayItems: (parentFieldId, arrayItems) =>
		set((state) => {
			const changedArrayItems = unwrapSetStateAction(
				arrayItems,
				state.arrayItems[parentFieldId] ?? [],
			);

			for (let i = 0; i < changedArrayItems.length; i++) {
				const ai = changedArrayItems[i]!;
				// Fix for when an item is added, reordered and then deleted
				// the items which were reordered still have the wrong order
				ai.order = i;
			}

			let arrayItemsGrouped: ArrayItemsGrouped = {
				...state.arrayItems,
				[parentFieldId]: changedArrayItems,
			};

			// Remove empty groups
			if (Object.values(arrayItemsGrouped).flat().length === 0) {
				arrayItemsGrouped = {};
			}
			for (const key in arrayItemsGrouped) {
				if (arrayItemsGrouped[key]!.length === 0) {
					delete arrayItemsGrouped[key];
				}
			}

			// For comparison only
			const arrayItemsGroupedWithoutDeleted: ArrayItemsGrouped = {};
			for (const [k, v] of Object.entries(arrayItemsGrouped)) {
				arrayItemsGroupedWithoutDeleted[k] = [];
				for (const item of v) {
					if (!isDeleted(item)) {
						arrayItemsGroupedWithoutDeleted[k]!.push(item);
					}
				}
			}

			return {
				arrayItems: arrayItemsGrouped,
				isDirty:
					JSON.stringify(state.originalComponents) !== JSON.stringify(state.components) ||
					JSON.stringify(state.originalNestedComponents) !==
						JSON.stringify(
							state.nestedComponents.filter((nc) => nc.diff !== "deleted"),
						) ||
					JSON.stringify(state.originalArrayItems) !==
						JSON.stringify(arrayItemsGroupedWithoutDeleted),
			};
		}),

	steps: [{ name: "components" }],
	setSteps: (steps) =>
		set((state) => {
			const newSteps = unwrapSetStateAction(steps, state.steps);
			return { steps: newSteps };
		}),

	init: (components, nestedComponents, arrayItems) => {
		// Group array items by parent
		const arrayItemsGrouped: ArrayItemsGrouped = {};
		for (const item of arrayItems) {
			const items = arrayItemsGrouped[item.parentFieldId] ?? [];
			if (!isDeleted(item)) {
				items.push(item);
			}
			arrayItemsGrouped[item.parentFieldId] = items;
		}

		parseStringifiedRichText(components, nestedComponents);

		set({
			components,
			originalComponents: components,

			nestedComponents,
			originalNestedComponents: nestedComponents,

			arrayItems: arrayItemsGrouped,
			originalArrayItems: structuredClone(arrayItemsGrouped),

			isDirty: false,
			isInitialized: true,
		});
	},
	isInitialized: false,

	onReset: null,
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
			state.onReset?.();

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
			if (!state.isDirty || state.isSaving || (state.isDirty && state.isTyping)) {
				return state;
			}

			// Fix component order
			const correctedComponents = state.components
				.filter((comp) => !isDeleted(comp))
				.map<ComponentUI>((comp, i) => ({
					...comp,
					order: i,
				}));

			// Fix array item order
			const correctedArrayItems = structuredClone(state.arrayItems);
			for (const parentId of Object.keys(correctedArrayItems)) {
				correctedArrayItems[parentId] = correctedArrayItems[parentId]!.filter(
					(item) => !isDeleted(item),
				);

				let i = 0;
				for (const item of correctedArrayItems[parentId]!) {
					if (item.order !== i) {
						item.order = i;
					}
					i++;
				}
			}

			// Serialize rich text
			const editor = createPlateEditor({
				plugins: richTextEditorPlugins,
				components: richTextEditorComponents, // Sometimes there are problems with placeholder plugin
			});
			for (const component of correctedComponents.concat(state.nestedComponents)) {
				for (const field of component.fields) {
					if (field.type === "RICH_TEXT") {
						field.serializedRichText = serializeHtml(editor, {
							nodes: field.data as unknown as Value,
							dndWrapper: (props) => (
								<DndProvider backend={HTML5Backend} {...props} />
							),
						});
						field.data = JSON.stringify(field.data);
					}
				}
			}

			type AddedComponent =
				inferRouterInputs<PrivateRouter>["pages"]["editPageComponents"]["addedComponents"][number];

			mutation.mutate(
				{
					pageId,
					addedComponents: correctedComponents
						.concat(state.nestedComponents)
						.filter((comp) => isAdded(comp) || isReplaced(comp)) // Also add replacing components
						.map<AddedComponent>((comp) => ({
							pageId,
							parentFieldId: comp.parentFieldId,
							parentArrayItemId: comp.parentArrayItemId,
							frontendId: comp.id,
							definition: comp.definition,
							order: comp.order,
							fields: comp.fields.map((field) => ({
								frontendId: field.id,
								data: field.data,
								serializedRichText: field.serializedRichText,
								definitionId: field.definitionId,
							})),
						})),
					editedComponents: correctedComponents
						.concat(state.nestedComponents)
						.filter(isNotChanged),
					deletedComponentIds: state.components
						.concat(state.nestedComponents)
						.filter((comp) => isDeleted(comp) || isReplaced(comp)) // Also delete replaced components
						.map((comp) => comp.id),

					addedArrayItems: Object.values(correctedArrayItems)
						.flat()
						.filter((item) => isAdded(item))
						.map((item) => ({
							frontendId: item.id,
							data: item.data,
							parentFieldId: item.parentFieldId,
							order: item.order,
						})),
					editedArrayItems: Object.values(correctedArrayItems)
						.flat()
						.filter(isNotChanged),
					deletedArrayItemIds: Object.values(state.arrayItems)
						.flat()
						.filter((item) => isDeleted(item))
						.map((item) => item.id),
				},
				{
					// `fidToBid` is a map of frontend ids to backend ids
					onSuccess: (fidToBid) => {
						state.iframe!.contentWindow!.postMessage(
							{ name: "update" } satisfies PageEditorMessage,
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
					onError: () => {
						parseStringifiedRichText(state.components, state.nestedComponents);
					},
					onSettled: () => {
						state.setIsSaving(false);
					},
				},
			);

			return {
				isSaving: true,
			};
		}),
}));

function parseStringifiedRichText(components: ComponentUI[], nestedComponents: ComponentUI[]) {
	for (const comp of components.concat(nestedComponents)) {
		for (const field of comp.fields) {
			if (field.type === "RICH_TEXT" && typeof field.data === "string") {
				field.data = JSON.parse(field.data) as Value as unknown as string;
			}
		}
	}
}

function isAdded(editable: Editable) {
	return editable.diff === "added";
}
function isDeleted(editable: Editable) {
	return editable.diff === "deleted";
}
function isReplaced(editable: Editable) {
	return editable.diff === "replaced";
}
function isNotChanged(editable: Editable) {
	return editable.diff === "none";
}
