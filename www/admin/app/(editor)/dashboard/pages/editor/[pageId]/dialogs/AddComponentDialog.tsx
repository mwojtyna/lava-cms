"use client";

import { ChevronRightIcon, CubeIcon, FolderIcon, HomeIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import type { ComponentsTableItem } from "@/app/(dashboard)/dashboard/components/ComponentsTable";
import {
	ActionIcon,
	Button,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	Input,
	Separator,
} from "@/src/components/ui/client";
import { Skeleton, Stepper, TypographyMuted } from "@/src/components/ui/server";
import { cn } from "@/src/utils/styling";
import { trpc } from "@/src/utils/trpc";

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
	onSubmit: (id: string) => void;
}
export function AddComponentDialog(props: Props) {
	const [groupId, setGroupId] = useState<string | null>(null);
	const [search, setSearch] = useState("");

	const { data, refetch } = trpc.components.getGroup.useQuery(groupId ? { id: groupId } : null, {
		enabled: props.open,
	});
	const list = data?.items;

	useEffect(() => {
		if (props.open) {
			setGroupId(null);
			setSearch("");
		}
	}, [props.open]);

	function openGroup(id: string | null) {
		setGroupId(id);
		void refetch();
	}

	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className="flex max-h-[66vh] flex-col">
				<DialogHeader>
					<DialogTitle>Add component</DialogTitle>
				</DialogHeader>

				<Input
					type="search"
					placeholder="Search this group..."
					value={search}
					onChange={(e) => setSearch(e.currentTarget.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							const item = list?.find((item) =>
								item.name.toLowerCase().includes(search.toLowerCase()),
							);
							if (!item) {
								return;
							}

							if (!item.isGroup) {
								props.onSubmit(item.id);
								props.setOpen(false);
							} else {
								openGroup(item.id);
								setSearch("");
							}
						}
					}}
				/>

				{/* Breadcrumbs */}
				{data && data.breadcrumbs.length > 0 && (
					<Stepper
						className="-mb-1"
						firstIsIcon
						steps={[
							<ActionIcon
								key={0}
								className="text-foreground"
								variant={"simple"}
								onClick={() => openGroup(null)}
							>
								<HomeIcon className="w-5" />
							</ActionIcon>,
							...data.breadcrumbs.map((breadcrumb, i) => (
								<Button
									key={i + 1}
									variant={"link"}
									className={cn(
										"whitespace-nowrap font-normal",
										i < data.breadcrumbs.length - 1 && "text-muted-foreground",
									)}
									onClick={() => openGroup(breadcrumb.id)}
								>
									{breadcrumb.name}
								</Button>
							)),
						]}
						currentStep={data.breadcrumbs.length}
						separator={<ChevronRightIcon className="w-4" />}
					/>
				)}

				{/* Items list */}
				{list ? (
					list.length > 0 ? (
						<ul className="max-h-full overflow-auto">
							{list.map((item, i) => {
								if (!item.name.toLowerCase().includes(search.toLowerCase())) {
									return null;
								}
								return (
									<ListItem
										key={item.id}
										item={item}
										groupClick={() => openGroup(item.id)}
										componentClick={() => {
											props.onSubmit(item.id);
											props.setOpen(false);
										}}
										isLast={i === list.length - 1}
									/>
								);
							})}
						</ul>
					) : (
						<TypographyMuted>No results.</TypographyMuted>
					)
				) : (
					<div className="space-y-2">
						<Skeleton className="h-[48.25px] w-full" />
						<Skeleton className="h-[48.25px] w-full" />
						<Skeleton className="h-[48.25px] w-full" />
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

interface ListItemProps {
	item: ComponentsTableItem;
	groupClick: () => void;
	componentClick: () => void;
	isLast: boolean;
}
function ListItem(props: ListItemProps) {
	return (
		<li className="mt-1">
			<Separator className="mb-1" />
			<Button
				className="w-full justify-start px-3 outline-0"
				variant={"outline"}
				size={"lg"}
				onClick={props.item.isGroup ? props.groupClick : props.componentClick}
			>
				{props.item.isGroup ? <FolderIcon className="w-5" /> : <CubeIcon className="w-5" />}
				{props.item.name}
			</Button>
			{props.isLast && <Separator className="mt-1" />}
		</li>
	);
}
