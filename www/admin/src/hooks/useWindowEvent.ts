import { useWindowEvent as useWindowEventMantine } from "@mantine/hooks";

export function useWindowEvent<K extends keyof WindowEventMap>(
	type: K,
	listener: K extends keyof WindowEventMap
		? (this: Window, ev: WindowEventMap[K]) => void
		: (this: Window, ev: CustomEvent) => void,
	options?: boolean | AddEventListenerOptions,
): void {
	useWindowEventMantine(type, listener, options);
}
