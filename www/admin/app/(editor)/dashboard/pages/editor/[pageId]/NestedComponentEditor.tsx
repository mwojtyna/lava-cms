import React from "react";
import type { NestedComponentUI } from "@/src/data/stores/pageEditor";

interface Props {
	nestedComponent: NestedComponentUI;
	onChange: (value: string) => void;
}
export function NestedComponentEditor(props: Props) {
	return <pre>{JSON.stringify(props.nestedComponent, null, 2)}</pre>;
}
