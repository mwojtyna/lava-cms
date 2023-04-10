"use client";

import { useMemo, useReducer } from "react";
import { Section } from "@admin/app/dashboard/(components)/Section";
import { trpcReact } from "@admin/src/utils/trpcReact";
import type { Page as PageType } from "api/prisma/types";
import Page from "./Page";
import NewPageModal from "./NewPageModal";
import EditPageModal from "./EditPageModal";
import DeletePageModal from "./DeletePageModal";

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

type Modals = "new" | "edit" | "delete";
interface State {
	newIsOpen: boolean;
	editIsOpen: boolean;
	deleteIsOpen: boolean;
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
		newIsOpen: false,
		editIsOpen: false,
		deleteIsOpen: false,
		page: rootNode.page,
	});

	return (
		<Section>
			{/* Setting page to root page instead of undefined when closing modals,
			 	because I don't want to deal with null handling */}
			<NewPageModal
				page={state.page}
				isOpen={state.newIsOpen}
				onClose={() => dispatch({ type: "close", modal: "new", page: rootNode.page })}
			/>
			<EditPageModal
				page={state.page}
				isOpen={state.editIsOpen}
				onClose={() => dispatch({ type: "close", modal: "edit", page: rootNode.page })}
			/>
			<DeletePageModal
				page={state.page}
				isOpen={state.deleteIsOpen}
				onClose={() => dispatch({ type: "close", modal: "delete", page: rootNode.page })}
			/>

			<Section.Title>Structure</Section.Title>
			<Page
				node={rootNode}
				openNewPageModal={(page) => {
					dispatch({ type: "open", modal: "new", page });
				}}
				openEditPageModal={(page) => {
					dispatch({ type: "open", modal: "edit", page });
				}}
				openDeletePageModal={(page) => {
					dispatch({ type: "open", modal: "delete", page });
				}}
				root
				last
			/>
		</Section>
	);
}
