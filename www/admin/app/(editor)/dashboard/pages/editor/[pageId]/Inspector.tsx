"use client";

import type { Component } from "./types";
import type { Page } from "@prisma/client";
import { ChevronRightIcon, CubeIcon, DocumentIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useViewportSize } from "@mantine/hooks";
import { Resizable } from "re-resizable";
import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/client";
import { Stepper, TypographyH1, TypographyMuted } from "@/src/components/ui/server";
import { usePageEditor } from "@/src/data/stores/pageEditor";
import { useWindowEvent } from "@/src/hooks";
import { cn } from "@/src/utils/styling";
import { trpc, trpcFetch } from "@/src/utils/trpc";
import { ComponentEditor } from "./ComponentEditor";
import { Components } from "./Components";
import { AddComponentDialog } from "./dialogs/AddComponentDialog";

export const MIN_WIDTH = 250;
const DEFAULT_WIDTH = MIN_WIDTH * 1.5;

interface Props {
	page: Page;
	components: Component[];
}
export function Inspector(props: Props) {
	const [openAdd, setOpenAdd] = useState(false);
	const [width, setWidth] = useState(DEFAULT_WIDTH);
	const { width: windowWidth } = useViewportSize();

	const { init, components, setComponents, steps, setSteps, isDirty, isValid, save } =
		usePageEditor();
	const { data } = trpc.pages.getPageComponents.useQuery(
		{ id: props.page.id },
		{ initialData: props.components },
	);
	useEffect(() => {
		init(data.map((comp) => ({ ...comp, diff: "none" })));
	}, [data, init]);

	const saveMutation = trpc.pages.editPageComponents.useMutation();
	useWindowEvent("keydown", (e) => {
		if ((e.ctrlKey || e.metaKey) && e.key === "s") {
			e.preventDefault();
			if (isDirty && isValid) {
				save(saveMutation, props.page.id);
			}
		}
	});

	useWindowEvent("beforeunload", (e) => {
		if (isDirty) {
			// Display a confirmation dialog
			e.preventDefault();
		}
	});

	async function addComponent(id: string) {
		const componentDef = await trpcFetch.components.getComponentDefinition.query({ id });
		const lastComponent = components.at(-1);
		setComponents([
			...components,
			{
				id: "",
				definition: {
					id: componentDef.id,
					name: componentDef.name,
				},
				order: lastComponent ? lastComponent.order + 1 : 0,
				fields: componentDef.field_definitions.map((fieldDef, i) => ({
					id: i.toString(),
					name: fieldDef.name,
					type: fieldDef.type,
					data: fieldDef.type === "SWITCH" ? "false" : "",
					definitionId: fieldDef.id,
					order: i,
				})),
				diff: "added",
			},
		]);
	}

	function getComponent(index: number) {
		return components.find((comp) => comp.order === index)!;
	}

	function displayStep() {
		const currentStep = steps.at(-1);
		switch (currentStep?.name) {
			case "components": {
				return (
					<>
						<Components
							// Avoid showing no components before hydration
							components={
								components.length > 0
									? components
									: props.components.map((comp) => ({ ...comp, diff: "none" }))
							}
							onComponentClicked={(index) =>
								setSteps([
									...steps,
									{ name: "edit-component", componentIndex: index },
								])
							}
						/>
						<Button
							className="w-full"
							variant={"outline"}
							icon={<PlusIcon className="w-5" />}
							onClick={() => setOpenAdd(true)}
						>
							Add component
						</Button>
					</>
				);
			}
			case "edit-component": {
				return <ComponentEditor component={getComponent(currentStep.componentIndex)!} />;
			}
		}
	}

	return (
		<>
			<Resizable
				// Use flex instead of space-y-5, because Resizable adds a div when resizing which messes up the spacing
				className="flex flex-col gap-5 overflow-y-auto p-4 max-md:hidden"
				minWidth={MIN_WIDTH}
				maxWidth={windowWidth !== 0 ? windowWidth / 2 : undefined} // `windowWidth` is 0 when SSR
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

				<div className="flex flex-col gap-5">
					{steps.length > 1 && (
						<Stepper
							className="overflow-x-auto"
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
											getComponent(step.componentIndex)?.definition.name}
									</Button>
								)),
							]}
							currentStep={steps.length}
							separator={<ChevronRightIcon className="w-4" />}
						/>
					)}

					{displayStep()}
				</div>
			</Resizable>

			<AddComponentDialog open={openAdd} setOpen={setOpenAdd} onSubmit={addComponent} />
		</>
	);
}
