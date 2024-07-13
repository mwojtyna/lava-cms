import type { ComponentFieldType } from "@prisma/client";

export function getInitialValue(type: ComponentFieldType, stringify?: boolean): string | object {
	switch (type) {
		case "RICH_TEXT": {
			const value = [
				{
					type: "p",
					children: [
						{
							text: "",
						},
					],
				},
			];
			return stringify ? JSON.stringify(value) : value;
		}
		case "SWITCH": {
			return "false";
		}
		default: {
			return "";
		}
	}
}

export function unwrapSetStateAction<T>(changed: React.SetStateAction<T>, state: T): T {
	const fun = changed as (state: T) => T; // Typescript is dumb
	return typeof changed === "function" ? fun(state) : changed;
}
