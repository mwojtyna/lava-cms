import type { inferRouterInputs } from "@trpc/server";
import { createPlateEditor, createPlugins, type Value } from "@udecode/plate-common";
import { serializeHtml } from "@udecode/plate-serializer-html";
import { create } from "zustand";
import type {
	Component,
	PageEditorMessage,
} from "@/app/(editor)/dashboard/pages/editor/[pageId]/types";
import {
	components as richTextEditorComponents,
	plugins as richTextEditorPlugins,
} from "@/src/components/RichTextEditor";
import type { PrivateRouter } from "@/src/trpc/routes/private/_private";
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
	isSaving: boolean;
	setIsSaving: (value: boolean) => void;

	iframe: HTMLIFrameElement | null;
	iframeOrigin: string;

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
const pageEditorStore = create<PageEditorState>((set) => ({
	isDirty: false,
	isSaving: false,
	setIsSaving: (value) => set({ isSaving: value }),

	iframe: null,
	iframeOrigin: "",

	originalComponents: [],
	components: [],
	setComponents: (changedComponents) =>
		set((state) => {
			let i = 0;
			for (const nc of changedComponents) {
				// Fix for when a component is added, reordered and then deleted
				// The components which were reordered still have the 'reordered' diff
				// but they are not reordered, because the added component was deleted
				nc.order = i;

				if (nc.diff === "edited" || nc.diff === "reordered") {
					const original = state.originalComponents.find((oc) => oc.id === nc.id)!;
					if (areSame(original, nc)) {
						nc.diff = "none";
					}
				}

				i++;
			}

			return {
				components: changedComponents,
				isDirty:
					JSON.stringify(state.originalComponents) !==
						JSON.stringify(changedComponents) ||
					JSON.stringify(state.originalNestedComponents) !==
						JSON.stringify(state.nestedComponents) ||
					JSON.stringify(state.originalArrayItems) !== JSON.stringify(state.arrayItems),
			};
		}),

	originalNestedComponents: [],
	nestedComponents: [],
	setNestedComponents: (changedNestedComponents) =>
		set((state) => {
			for (const nc of changedNestedComponents) {
				if (nc.diff === "edited" || nc.diff === "reordered") {
					const original = state.originalNestedComponents.find((oc) => oc.id === nc.id)!;
					if (areSame(original, nc)) {
						nc.diff = "none";
					}
				}
			}

			return {
				nestedComponents: changedNestedComponents,
				isDirty:
					JSON.stringify(state.originalComponents) !== JSON.stringify(state.components) ||
					JSON.stringify(state.originalNestedComponents) !==
						JSON.stringify(changedNestedComponents) ||
					JSON.stringify(state.originalArrayItems) !== JSON.stringify(state.arrayItems),
			};
		}),

	originalArrayItems: {},
	arrayItems: {},
	setArrayItems: (parentFieldId, changedArrayItems) =>
		set((state) => {
			let i = 0;
			for (const ai of changedArrayItems) {
				// Fix for when an item is added, reordered and then deleted
				// The items which were reordered still have the 'reordered' diff
				// but they are not reordered, because the added item was deleted
				ai.order = i;

				if (ai.diff === "edited" || ai.diff === "reordered") {
					const original = state.originalArrayItems[parentFieldId]!.find(
						(oc) => oc.id === ai.id,
					)!;

					if (areSame(original, ai)) {
						ai.diff = "none";
					}
				}

				i++;
			}
			let arrayItems: ArrayItemGroups = {
				...state.arrayItems,
				[parentFieldId]: changedArrayItems,
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
			if (!state.isDirty || state.isSaving) {
				return state;
			}

			type AddedComponent =
				inferRouterInputs<PrivateRouter>["pages"]["editPageComponents"]["addedComponents"][number];

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

			const allComponents = state.components.concat(state.nestedComponents);

			const editor = createPlateEditor({
				plugins: createPlugins(richTextEditorPlugins, {
					components: richTextEditorComponents,
				}),
			});
			for (const component of state.components.concat(state.nestedComponents)) {
				for (const field of component.fields) {
					if (field.type === "RICH_TEXT") {
						field.serializedRichText = serializeHtml(editor, {
							nodes: field.data as unknown as Value,
						});
						field.data = JSON.stringify(field.data);
					}
				}
			}

			const flattenedItems = Object.values(state.arrayItems).flat();

			mutation.mutate(
				{
					pageId,
					addedComponents: allComponents
						.filter((comp) => comp.diff === "added" || comp.diff === "replaced")
						.map<AddedComponent>((comp) => ({
							pageId,
							parentComponentId: comp.parentComponentId,
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
					editedComponents: correctedOrderComponents
						.concat(state.nestedComponents)
						.filter((comp) => comp.diff === "edited" || comp.diff === "reordered"),
					deletedComponentIds: allComponents // Replaced components have the same id as the original
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

						state.setIsSaving(false);
					},
				},
			);

			return {
				isSaving: true,
			};
		}),
}));

function areSame<T extends { diff: Diff }>(original: T, current: T) {
	const a = { ...original, diff: undefined };
	const b = { ...current, diff: undefined };
	return JSON.stringify(a) === JSON.stringify(b);
}

function usePageEditor() {
	const isDirty = pageEditorStore((state) => state.isDirty);
	const isSaving = pageEditorStore((state) => state.isSaving);

	const iframe = pageEditorStore((state) => state.iframe);
	const iframeOrigin = pageEditorStore((state) => state.iframeOrigin);

	const originalComponents = pageEditorStore((state) => state.originalComponents);
	const components = pageEditorStore((state) => state.components);
	const setComponents = pageEditorStore((state) => state.setComponents);

	const originalNestedComponents = pageEditorStore((state) => state.originalNestedComponents);
	const nestedComponents = pageEditorStore((state) => state.nestedComponents);
	const setNestedComponents = pageEditorStore((state) => state.setNestedComponents);

	const originalArrayItems = pageEditorStore((state) => state.originalArrayItems);
	const arrayItems = pageEditorStore((state) => state.arrayItems);
	const setArrayItems = pageEditorStore((state) => state.setArrayItems);

	const steps = pageEditorStore((state) => state.steps);
	const setSteps = pageEditorStore((state) => state.setSteps);

	const init = pageEditorStore((state) => state.init);
	const reset = pageEditorStore((state) => state.reset);
	const save = pageEditorStore((state) => state.save);

	return {
		isDirty,
		isSaving,
		iframe,
		iframeOrigin,
		originalComponents,
		components,
		setComponents,
		originalNestedComponents,
		nestedComponents,
		setNestedComponents,
		originalArrayItems,
		arrayItems,
		setArrayItems,
		steps,
		setSteps,
		init,
		reset,
		save,
	};
}

export { usePageEditor, pageEditorStore };
