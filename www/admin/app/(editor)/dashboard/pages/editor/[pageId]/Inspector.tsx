"use client";

import type { Component } from "./types";
import type { Page } from "@prisma/client";
import { ChevronRightIcon, CubeIcon, DocumentIcon, PlusIcon } from "@heroicons/react/24/outline";
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

interface Props {
	page: Page;
	components: Component[];
}
export function Inspector(props: Props) {
	const [openAdd, setOpenAdd] = useState(false);

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
		setComponents([
			...components,
			{
				id: "",
				definition: {
					id: componentDef.id,
					name: componentDef.name,
				},
				order: components.length,
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
		setOpenAdd(false);
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
			<div className="overflow-auto border-l p-4">
				<header className="mb-4">
					<TypographyH1 className="text-4xl">{props.page.name}</TypographyH1>
					<TypographyMuted className="text-base">{props.page.url}</TypographyMuted>
				</header>

				<div className="flex flex-col gap-4">
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
			</div>

			<AddComponentDialog open={openAdd} setOpen={setOpenAdd} onSubmit={addComponent} />
		</>
	);
}
