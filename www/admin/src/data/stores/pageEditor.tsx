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
import { plugins as richTextEditorPlugins } from "@/src/components/RichTextEditor";
import type { PrivateRouter } from "@/src/trpc/routes/private/_private";
import type { ArrayItem } from "@/src/trpc/routes/private/pages/types";
import type { trpc } from "@/src/utils/trpc";
import { unwrapSetStateAction } from "./utils";
import "client-only";

export type Diff = "added" | "edited" | "deleted" | "replaced" | "none";
interface Editable {
	diff: Diff;
	reordered: boolean;
}

export type ComponentUI = Component & Editable;
export type FieldUI = ComponentUI["fields"][number];
export type ArrayItemUI = ArrayItem & Editable;
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

	originalArrayItems: ArrayItemGroups;
	arrayItems: ArrayItemGroups;
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

				if (isEdited(nc)) {
					const original = state.originalComponents.find((oc) => oc.id === nc.id)!;
					if (areSame(original, nc)) {
						nc.diff = "none";
					}
					if (original.order === nc.order) {
						nc.reordered = false;
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
	setNestedComponents: (components) =>
		set((state) => {
			const newNestedComponents = unwrapSetStateAction(components, state.nestedComponents);

			for (const nc of newNestedComponents) {
				if (isEdited(nc)) {
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
	setArrayItems: (parentFieldId, arrayItems) =>
		set((state) => {
			const changedArrayItems = unwrapSetStateAction(
				arrayItems,
				state.arrayItems[parentFieldId] ?? [],
			);

			for (let i = 0; i < changedArrayItems.length; i++) {
				const ai = changedArrayItems[i]!;
				// Fix for when an item is added, reordered and then deleted
				// The items which were reordered still have the 'reordered' diff
				// but they are not reordered, because the added item was deleted
				ai.order = i;

				if (isEdited(ai)) {
					const original = state.originalArrayItems[parentFieldId]!.find(
						(oc) => oc.id === ai.id,
					)!;

					if (areSame(original, ai)) {
						ai.diff = "none";
					}
					if (original.order === ai.order) {
						ai.reordered = false;
					}
				}
			}

			let arrayItemsGrouped: ArrayItemGroups = {
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

			return {
				arrayItems: arrayItemsGrouped,
				isDirty:
					JSON.stringify(state.originalComponents) !== JSON.stringify(state.components) ||
					JSON.stringify(state.originalNestedComponents) !==
						JSON.stringify(state.nestedComponents) ||
					JSON.stringify(state.originalArrayItems) !== JSON.stringify(arrayItemsGrouped),
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
		const arrayItemsGrouped: ArrayItemGroups = {};
		for (const item of arrayItems) {
			const items = arrayItemsGrouped[item.parentFieldId] ?? [];
			if (!isDeleted(item)) {
				items.push(item);
			}
			arrayItemsGrouped[item.parentFieldId] = items;
		}

		// Parse stringified rich text
		for (const comp of components.concat(nestedComponents)) {
			for (const field of comp.fields) {
				if (field.type === "RICH_TEXT" && typeof field.data === "string") {
					field.data = JSON.parse(field.data) as Value as unknown as string;
				}
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

			type AddedComponent =
				inferRouterInputs<PrivateRouter>["pages"]["editPageComponents"]["addedComponents"][number];

			// Fix component order
			const correctedComponents = state.components
				.filter((comp) => !isDeleted(comp))
				.map<ComponentUI>((comp, i) => {
					const original = state.originalComponents.find((oc) => oc.id === comp.id);
					return {
						...comp,
						order: i,
						reordered: original ? i !== original.order : comp.reordered,
					};
				});

			// Fix array item order
			const correctedArrayItems: ArrayItemGroups = structuredClone(state.arrayItems);
			for (const parentId of Object.keys(correctedArrayItems)) {
				correctedArrayItems[parentId] = correctedArrayItems[parentId]!.filter(
					(item) => !isDeleted(item),
				);

				let i = 0;
				for (const item of correctedArrayItems[parentId]!) {
					if (item.order !== i) {
						item.reordered = true;
						item.order = i;
					}
					i++;
				}
			}

			// Serialize rich text
			const editor = createPlateEditor({
				plugins: richTextEditorPlugins,
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

			mutation.mutate(
				{
					pageId,
					addedComponents: correctedComponents
						.concat(state.nestedComponents)
						.filter((comp) => isAdded(comp) || isReplaced(comp))
						.map<AddedComponent>((comp) => ({
							pageId,
							parentFieldId: comp.parentFieldId,
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
						.filter((comp) => isEdited(comp)),
					deletedComponentIds: state.components
						.concat(state.nestedComponents) // Replaced components have the same id as the original
						.filter((comp) => isDeleted(comp) || isReplaced(comp))
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
						.filter(
							(item) =>
								isEdited(item) ||
								// isReplaced is for when the item is of type COMPONENT, see ArrayFieldItem handleChange() function
								isReplaced(item),
						),
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

function removeId(obj: Record<string, unknown>) {
	for (const key in obj) {
		if (key === "id") {
			delete obj[key];
		} else if (typeof obj[key] === "object") {
			removeId(obj[key] as Record<string, unknown>);
		}
	}
}
function areSame<T extends Editable>(original: T, current: T) {
	const a: Partial<T> = { ...original, diff: undefined, reordered: undefined };
	const b: Partial<T> = { ...current, diff: undefined, reordered: undefined };

	// Remove id from rich text data, otherwise restoring doesn't clear diffs
	if ("fields" in current) {
		const fields = current.fields as FieldUI[];
		for (const field of fields) {
			if (field.type === "RICH_TEXT" && typeof field.data === "object") {
				removeId(field.data as Record<string, unknown>);
			}
		}
	}

	return JSON.stringify(a) === JSON.stringify(b);
}

function isAdded(editable: Editable) {
	return editable.diff === "added";
}
function isEdited(editable: Editable) {
	return editable.diff === "edited" || (editable.reordered && editable.diff === "none");
}
function isDeleted(editable: Editable) {
	return editable.diff === "deleted";
}
function isReplaced(editable: Editable) {
	return editable.diff === "replaced";
}
