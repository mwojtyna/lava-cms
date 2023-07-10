import type { Plugin } from "vite";
import type { ClientConfigAstro } from "./adapter";

export function vitePluginLavaCmsConfig(config: ClientConfigAstro): Plugin {
	const virtualModuleId = "virtual:lavacms-config";
	const resolvedVirtualModuleId = "\0" + virtualModuleId;

	return {
		name: "lavacms-config",
		// @ts-expect-error - not all code paths return a value
		resolveId: (id) => {
			if (id === virtualModuleId) {
				return resolvedVirtualModuleId;
			}
		},
		// @ts-expect-error - not all code paths return a value
		load: (id) => {
			if (id === resolvedVirtualModuleId) {
				return `export default ${JSON.stringify(config)}`;
			}
		},
	};
}
