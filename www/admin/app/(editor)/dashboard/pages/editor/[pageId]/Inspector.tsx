"use client";

import type { Component } from "./types";
import type { Page } from "@prisma/client";
import { ChevronRightIcon, CubeIcon, DocumentIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Button } from "@admin/src/components/ui/client";
import { Stepper, TypographyH1, TypographyMuted } from "@admin/src/components/ui/server";
import { cn } from "@admin/src/utils/styling";
import { trpc } from "@admin/src/utils/trpc";
import { Components } from "./Components";
import { AddComponentDialog } from "./dialogs/AddComponentDialog";
import { EditComponent } from "./EditComponent";

type Step =
	| {
			name: "components";
	  }
	| {
			name: "edit-component";
			componentId: string;
	  };

interface Props {
	page: Page;
	components: Component[];
}
export function Inspector(props: Props) {
	const [openAdd, setOpenAdd] = useState(false);
	const [steps, setSteps] = useState<Step[]>([{ name: "components" }]);

	const { data: components } = trpc.pages.getPageComponents.useQuery(
		{ id: props.page.id },
		{ initialData: props.components },
	);

	function getComponent(id: string) {
		return components.find((comp) => comp.id === id)!;
	}
	function displayStep() {
		const currentStep = steps.at(-1)!;
		switch (currentStep.name) {
			case "components": {
				return (
					<>
						<Components
							components={components}
							onComponentClicked={(id) =>
								setSteps((prev) => [
									...prev,
									{ name: "edit-component", componentId: id },
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
				return <EditComponent component={getComponent(currentStep.componentId)} />;
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
										onClick={() => setSteps((prev) => prev.slice(0, i + 2))}
									>
										<CubeIcon className="w-4" />
										{step.name === "edit-component" &&
											getComponent(step.componentId).name}
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

			<AddComponentDialog
				open={openAdd}
				setOpen={setOpenAdd}
				onSubmit={(id) => console.log(id)}
			/>
		</>
	);
}
