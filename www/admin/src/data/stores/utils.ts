export function unwrapSetStateAction<T>(changed: React.SetStateAction<T>, state: T): T {
	// Typescript is dumb
	const fun = changed as (state: T) => T;
	return typeof changed === "function" ? fun(state) : changed;
}
