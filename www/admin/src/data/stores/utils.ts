export const RICH_TEXT_INITIAL_VALUE = [
	{
		type: "p",
		children: [
			{
				text: "",
			},
		],
	},
];
export const SWITCH_INITIAL_VALUE = "false";
export const REGULAR_INITIAL_VALUE = "";

export function unwrapSetStateAction<T>(changed: React.SetStateAction<T>, state: T): T {
	// Typescript is dumb
	const fun = changed as (state: T) => T;
	return typeof changed === "function" ? fun(state) : changed;
}
