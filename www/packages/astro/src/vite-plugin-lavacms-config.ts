import type { ClientConfigAstro } from "./adapter";
import type { Plugin } from "vite";

export function vitePluginLavaCmsConfig(config: ClientConfigAstro): Plugin {
	const virtualModuleId = "virtual:lavacms-config";
	const resolvedVirtualModuleId = "\0" + virtualModuleId;

	return {
		name: "lavacms-config",
		resolveId: (id) => {
			if (id === virtualModuleId) {
				return resolvedVirtualModuleId;
			}
		},
		load: (id) => {
			if (id === resolvedVirtualModuleId) {
				return `export default ${JSON.stringify(config)}`;
			}
		},
	};
}
