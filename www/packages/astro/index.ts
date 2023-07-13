export { lavaCmsAstro } from "./src/adapter";
export { useLavaCms, ApiClient } from "@lavacms/core";

import type { LavaCms as LavaCmsCore } from "@lavacms/core";
export namespace LavaCms {
	export type Component = LavaCmsCore.Component;
}
