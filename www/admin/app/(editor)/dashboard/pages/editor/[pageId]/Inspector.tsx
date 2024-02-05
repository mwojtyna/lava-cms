"use client";

import type { Page } from "@prisma/client";
import type { inferRouterOutputs } from "@trpc/server";
import { ChevronRightIcon, CubeIcon, DocumentIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useHotkeys, useViewportSize } from "@mantine/hooks";
import { Resizable } from "re-resizable";
import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/client";
import { Stepper, TypographyH1, TypographyMuted } from "@/src/components/ui/server";
import { pageEditorStore, usePageEditor } from "@/src/data/stores/pageEditor";
import { type Step as StepType, type ComponentUI } from "@/src/data/stores/pageEditor";
import { useWindowEvent } from "@/src/hooks";
import type { PrivateRouter } from "@/src/trpc/routes/private/_private";
import { cn } from "@/src/utils/styling";
import { trpc } from "@/src/utils/trpc";
import { ComponentEditor } from "./ComponentEditor";
import { Components } from "./Components";
import { AddComponentDialog, createComponentInstance } from "./dialogs/AddComponentDialog";

export const MIN_WIDTH = 300;
const DEFAULT_WIDTH = MIN_WIDTH * 1.75;

// Placeholder component to avoid undefined error when saving and current step's
// component id hasn't been swapped to backend's id yet
const COMPONENT_PLACEHOLDER: ComponentUI = {
	id: "",
	definition: {
		id: "",
		name: "<Missing>",
	},
	order: 0,
	fields: [],
	pageId: "",
	parentComponentId: "",
	diff: "none",
};

interface Props {
	page: Page;
	serverData: inferRouterOutputs<PrivateRouter>["pages"]["getPageComponents"];
}
export function Inspector(props: Props) {
	const [openAdd, setOpenAdd] = useState(false);
	const [width, setWidth] = useState(DEFAULT_WIDTH);
	const { width: windowWidth } = useViewportSize();

	const {
		init,
		components,
		setComponents,
		nestedComponents,
		steps,
		setSteps,
		isDirty,
		isValid,
		save,
	} = usePageEditor();
	const { data } = trpc.pages.getPageComponents.useQuery(
		{ id: props.page.id },
		{ initialData: props.serverData },
	);
	useEffect(() => {
		init(
			data.components.map((comp) => ({ ...comp, diff: "none" })),
			data.nestedComponents.map((comp) => ({ ...comp, diff: "none" })),
			data.arrayItems.map((item) => ({ ...item, diff: "none" })),
		);
	}, [data, init]);

	const saveMutation = trpc.pages.editPageComponents.useMutation();
	useHotkeys(
		[
			[
				"mod+s",
				() => {
					if (isDirty && isValid) {
						save(saveMutation, props.page.id);
					}
				},
			],
		],
		[],
	);
	useWindowEvent("beforeunload", (e) => {
		if (isDirty) {
			// Display a confirmation dialog
			e.preventDefault();
		}
	});

	async function addComponent(id: string) {
		const lastComponent = components.at(-1);
		const newComponent = await createComponentInstance(id, {
			pageId: props.page.id,
			parentComponentId: null,
			order: lastComponent ? lastComponent.order + 1 : 0,
		});

		setComponents([...components, newComponent]);
	}

	function getComponent(id: string): ComponentUI {
		return components.find((comp) => comp.id === id) ?? COMPONENT_PLACEHOLDER;
	}
	function getNestedComponent(id: string): ComponentUI {
		return nestedComponents.find((comp) => comp.id === id) ?? COMPONENT_PLACEHOLDER;
	}

	return (
		<>
			<Resizable
				// Use flex instead of space-y-5, because Resizable adds a div when resizing which messes up the spacing
				className="flex flex-col gap-5 overflow-y-auto p-4 max-md:hidden"
				minWidth={MIN_WIDTH}
				maxWidth={windowWidth !== 0 ? windowWidth * (2 / 3) : undefined} // `windowWidth` is 0 when SSR
				size={{ width, height: "100%" }}
				enable={{ left: true }}
				handleComponent={{
					left: (
						<div className="mx-auto h-full w-px bg-border transition-colors group-hover:w-[3px] group-hover:bg-brand group-active:w-[3px] group-active:bg-brand" />
					),
				}}
				handleClasses={{
					left: "group",
				}}
				handleStyles={{
					left: {
						width: 16,
						left: -8,
					},
				}}
				onResizeStop={(_, __, ___, delta) => setWidth(width + delta.width)}
			>
				<header>
					<TypographyH1 className="text-4xl">{props.page.name}</TypographyH1>
					<TypographyMuted className="text-base">{props.page.url}</TypographyMuted>
				</header>

				{steps.length > 1 && (
					<Stepper
						className="flex-wrap"
						firstIsIcon
						steps={[
							<Button
								key={0}
								variant={"link"}
								className="gap-1 font-normal text-muted-foreground"
								onClick={() => setSteps([{ name: "components" }])}
							>
								<DocumentIcon className="w-4" />
								{props.page.name}
							</Button>,
							...steps.slice(1).map((step, i) => (
								<Button
									key={i + 1}
									variant={"link"}
									className={cn(
										"gap-1 whitespace-nowrap font-normal",
										i + 1 < steps.length - 1 && "text-muted-foreground",
									)}
									onClick={() => setSteps(steps.slice(0, i + 2))}
								>
									<CubeIcon className="w-4" />
									{step.name === "edit-component" &&
										getComponent(step.componentId).definition.name}
									{step.name === "edit-nested-component" &&
										getNestedComponent(step.nestedComponentId).definition.name}
								</Button>
							)),
						]}
						currentStep={steps.length}
						separator={<ChevronRightIcon className="w-4" />}
					/>
				)}

				<Step
					step={steps.at(-1)!}
					// Avoid showing no components before hydration
					components={
						components.length > 0
							? components
							: props.serverData.components.map((c) => ({
									...c,
									diff: "none",
							  }))
					}
					openAddComponentDialog={() => setOpenAdd(true)}
					getComponent={getComponent}
					getNestedComponent={getNestedComponent}
				/>
			</Resizable>

			<AddComponentDialog open={openAdd} setOpen={setOpenAdd} onSubmit={addComponent} />
		</>
	);
}

interface StepProps {
	step: StepType;
	components: ComponentUI[];
	getComponent: (id: string) => ComponentUI;
	getNestedComponent: (id: string) => ComponentUI;
	openAddComponentDialog: () => void;
}
function Step(props: StepProps) {
	const { steps, setSteps, setComponents, setNestedComponents } = usePageEditor();

	// Typescript is stupid and doesn't properly narrow the type of `props.step` in the switch statement
	const step = props.step;
	switch (step.name) {
		case "components": {
			return (
				<div className="flex flex-col gap-5">
					<Components
						components={props.components}
						onComponentClicked={(id) =>
							setSteps([...steps, { name: "edit-component", componentId: id }])
						}
					/>
					<Button
						className="w-full"
						variant={"outline"}
						icon={<PlusIcon className="w-5" />}
						onClick={props.openAddComponentDialog}
					>
						Add component
					</Button>
				</div>
			);
		}
		case "edit-component": {
			return (
				<ComponentEditor
					component={props.getComponent(step.componentId)}
					onChange={(data) => {
						const changedComponents: ComponentUI[] = props.components.map(
							(component) => {
								if (component.id === step.componentId) {
									return {
										...component,
										fields: component.fields.map((field) => ({
											...field,
											data: data[field.id]!,
										})),
										diff:
											component.diff === "added" ? component.diff : "edited",
									};
								} else {
									return component;
								}
							},
						);
						setComponents(changedComponents);
					}}
				/>
			);
		}
		case "edit-nested-component": {
			return (
				<ComponentEditor
					component={props.getNestedComponent(step.nestedComponentId)}
					onChange={(data) => {
						// Don't know why, but when using nestedComponents from the usePageEditor hook,
						// the components are outdated and when NestedComponentField changes nestedComponents,
						// the changes get overwritten by the code below. So we use the state directly.
						const nestedComponents = pageEditorStore.getState().nestedComponents;
						const changedComponents: ComponentUI[] = nestedComponents.map(
							(component) => {
								if (component.id === step.nestedComponentId) {
									return {
										...component,
										fields: component.fields.map((field) => ({
											...field,
											data: data[field.id]!,
										})),
										diff:
											component.diff === "added" ||
											component.diff === "replaced"
												? component.diff
												: "edited",
									};
								} else {
									return component;
								}
							},
						);
						setNestedComponents(changedComponents);
					}}
				/>
			);
		}
	}
}
