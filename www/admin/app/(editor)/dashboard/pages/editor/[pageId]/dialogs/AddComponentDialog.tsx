import { useState } from "react";
import { ChevronRightIcon, CubeIcon, FolderIcon, HomeIcon } from "@heroicons/react/24/outline";
import {
	ActionIcon,
	Button,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	Input,
	Separator,
} from "@admin/src/components/ui/client";
import { trpc } from "@admin/src/utils/trpc";
import { Loader, Stepper, TypographyMuted } from "@admin/src/components/ui/server";
import type { ComponentsTableItem } from "@admin/app/(dashboard)/dashboard/components/ComponentsTable";
import { cn } from "@admin/src/utils/styling";

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
}
export function AddComponentDialog(props: Props) {
	const [groupId, setGroupId] = useState<string | null>(null);
	const [search, setSearch] = useState("");

	const { data, refetch } = trpc.components.getGroup.useQuery(groupId ? { id: groupId } : null);
	const list = data?.items;

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
					placeholder="Search..."
					value={search}
					onChange={(e) => setSearch(e.currentTarget.value)}
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
										key={i}
										item={item}
										groupClick={() => openGroup(item.id)}
										componentClick={() => {
											console.log("Add component", item.name);
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
					<p>
						<Loader className="mr-2" />
						Loading...
					</p>
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
