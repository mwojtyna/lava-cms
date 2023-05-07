"use client";

import { useMemo, useReducer, useState } from "react";
import { Loader, LoadingOverlay, useMantineColorScheme } from "@admin/src/components";
import { Section } from "@admin/_app/_components/Section";
import { trpcReact } from "@admin/src/utils/trpcReact";
import type { Page as PageType } from "api/prisma/types";
import Page from "./Page";
import AddPageModal from "./AddPageModal";
import EditPageModal from "./EditPageModal";
import DeletePageModal from "./DeletePageModal";
import MovePageModal from "./MovePageModal";

export interface TreeNode {
	page: PageType;
	children: TreeNode[];
}

let rootNode: TreeNode;
export function getNode(id: string = rootNode.page.id, node: TreeNode = rootNode): TreeNode | null {
	if (node.page.id === id) {
		return node;
	}

	for (const child of node.children) {
		const found = getNode(id, child);
		if (found) {
			return found;
		}
	}

	return null;
}

export const invalidUrls = ["/admin"];

type Modals = "add" | "edit" | "delete" | "move";
interface State {
	addIsOpen: boolean;
	editIsOpen: boolean;
	deleteIsOpen: boolean;
	moveIsOpen: boolean;
}
type Action =
	| {
			type: "open";
			modal: Modals;
			node: TreeNode;
	  }
	| {
			type: "close";
			modal: Modals;
			node: TreeNode;
	  };

function reducer(state: State, action: Action): State & { node: TreeNode } {
	if (action.type === "open") {
		return {
			...state,
			[action.modal + "IsOpen"]: true,
			node: action.node,
		};
	} else if (action.type === "close") {
		return {
			...state,
			[action.modal + "IsOpen"]: false,
			node: action.node,
		};
	}

	throw new Error("Invalid action!");
}

export interface PagesModalProps {
	isOpen: boolean;
	node: TreeNode;
	onClose: () => void;
}

export default function PageTree({ initialData }: { initialData: PageType[] }) {
	const data = trpcReact.pages.getPages.useQuery().data ?? initialData;
	const colorScheme = useMantineColorScheme();

	rootNode = useMemo(() => {
		const rootPage = data.find((page) => page.url === "/")!;
		return {
			page: rootPage,
			children: findChildren(rootPage),
		};

		function findChildren(root: PageType) {
			const children: PageType[] = data.filter((page) => page.parent_id === root.id);
			if (children.length === 0) {
				return [];
			}

			const nodeChildren: TreeNode[] = [];
			children.forEach((child) => {
				nodeChildren.push({
					page: child,
					children: findChildren(child),
				});
			});

			return nodeChildren.sort((a, b) => a.page.order - b.page.order);
		}
	}, [data]);

	const [state, dispatch] = useReducer(reducer, {
		addIsOpen: false,
		editIsOpen: false,
		deleteIsOpen: false,
		moveIsOpen: false,
		node: rootNode,
	});
	const [reordering, setReordering] = useState(false);

	return (
		<Section>
			<AddPageModal
				node={state.node}
				isOpen={state.addIsOpen}
				onClose={() => dispatch({ type: "close", modal: "add", node: state.node })}
			/>
			<EditPageModal
				node={state.node}
				isOpen={state.editIsOpen}
				onClose={() => dispatch({ type: "close", modal: "edit", node: state.node })}
			/>
			<DeletePageModal
				node={state.node}
				isOpen={state.deleteIsOpen}
				onClose={() => dispatch({ type: "close", modal: "delete", node: state.node })}
			/>
			<MovePageModal
				node={state.node}
				isOpen={state.moveIsOpen}
				onClose={() => dispatch({ type: "close", modal: "move", node: state.node })}
				allPages={data}
			/>

			<LoadingOverlay
				visible={reordering}
				loader={
					<Loader
						variant="dots"
						size="xl"
						color={colorScheme.colorScheme === "dark" ? "#fff" : "#333"}
					/>
				}
			/>

			<Section.Title>Structure</Section.Title>
			<Page
				node={rootNode}
				openAddPageModal={(node) => {
					dispatch({ type: "open", modal: "add", node });
				}}
				openEditPageModal={(node) => {
					dispatch({ type: "open", modal: "edit", node });
				}}
				openDeletePageModal={(node) => {
					dispatch({ type: "open", modal: "delete", node });
				}}
				openMovePageModal={(node) => {
					dispatch({ type: "open", modal: "move", node });
				}}
				setReordering={setReordering}
				root
				last
			/>
		</Section>
	);
}
