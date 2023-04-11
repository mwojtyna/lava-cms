"use client";

import { useMemo, useReducer } from "react";
import { Section } from "@admin/app/dashboard/(components)/Section";
import { trpcReact } from "@admin/src/utils/trpcReact";
import type { Page as PageType } from "api/prisma/types";
import Page from "./Page";
import AddPageModal from "./AddPageModal";
import EditPageModal from "./EditPageModal";
import DeletePageModal from "./DeletePageModal";
import MovePageModal from "./MovePageModal";

export interface Node {
	page: PageType;
	children: Node[];
}
let rootNode: Node;

export function getNode(id: string = rootNode.page.id, node: Node = rootNode): Node | null {
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
			page: PageType;
	  }
	| {
			type: "close";
			modal: Modals;
			page: PageType;
	  };

function reducer(state: State, action: Action): State & { page: PageType } {
	if (action.type === "open") {
		return {
			...state,
			[action.modal + "IsOpen"]: true,
			page: action.page,
		};
	} else if (action.type === "close") {
		return {
			...state,
			[action.modal + "IsOpen"]: false,
			page: action.page,
		};
	}

	throw new Error("Invalid action!");
}

export interface PagesModalProps {
	isOpen: boolean;
	page: PageType;
	onClose: () => void;
}

export default function PageTree({ initialData }: { initialData: PageType[] }) {
	const data = trpcReact.pages.getPages.useQuery().data ?? initialData;

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

			const nodeChildren: Node[] = [];
			children.forEach((child) => {
				nodeChildren.push({
					page: child,
					children: findChildren(child),
				});
			});

			return nodeChildren;
		}
	}, [data]);

	const [state, dispatch] = useReducer(reducer, {
		addIsOpen: false,
		editIsOpen: false,
		deleteIsOpen: false,
		moveIsOpen: false,
		page: rootNode.page,
	});

	return (
		<Section>
			<AddPageModal
				page={state.page}
				isOpen={state.addIsOpen}
				onClose={() => dispatch({ type: "close", modal: "add", page: state.page })}
			/>
			<EditPageModal
				page={state.page}
				isOpen={state.editIsOpen}
				onClose={() => dispatch({ type: "close", modal: "edit", page: state.page })}
			/>
			<DeletePageModal
				page={state.page}
				isOpen={state.deleteIsOpen}
				onClose={() => dispatch({ type: "close", modal: "delete", page: state.page })}
			/>
			<MovePageModal
				page={state.page}
				isOpen={state.moveIsOpen}
				onClose={() => dispatch({ type: "close", modal: "move", page: state.page })}
				allPages={data}
			/>

			<Section.Title>Structure</Section.Title>
			<Page
				node={rootNode}
				openAddPageModal={(page) => {
					dispatch({ type: "open", modal: "add", page });
				}}
				openEditPageModal={(page) => {
					dispatch({ type: "open", modal: "edit", page });
				}}
				openDeletePageModal={(page) => {
					dispatch({ type: "open", modal: "delete", page });
				}}
				openMovePageModal={(page) => {
					dispatch({ type: "open", modal: "move", page });
				}}
				root
				last
			/>
		</Section>
	);
}
