import type { LavaCms as LavaCmsCore } from "@lavacms/core";

export { lavaCmsAstro } from "./src/adapter";
export { useLavaCms, ApiClient } from "@lavacms/core";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace LavaCms {
	export type Component = LavaCmsCore.Component;
}
