import type { ClientConfigAstro } from "./integration";
import type { Plugin } from "vite";
import camelcase from "camelcase";

export function vitePluginLavaCmsComponents(components: ClientConfigAstro["components"]): Plugin {
	const virtualModuleId = "virtual:lavacms-components";
	const resolvedVirtualModuleId = "\0" + virtualModuleId;

	return {
		name: "lavacms-components",
		resolveId: (id) => {
			if (id === virtualModuleId) {
				return resolvedVirtualModuleId;
			}
		},
		async load(id) {
			if (id === resolvedVirtualModuleId) {
				if (components === undefined || Object.values(components).length === 0) {
					throw new Error(`No CMS components are registered in Astro config`);
				}

				const imports: string[] = [];

				for (const [name, path] of Object.entries(components)) {
					const resolvedId = await this.resolve(path);

					if (!resolvedId) {
						throw new Error(
							`Astro component could not be found for CMS component "${name}"! Does "${path}" exist?`,
						);
					} else {
						imports.push(`import ${camelcase(name)} from "${resolvedId.id}"`);
					}
				}

				return `${imports.join(";")}; export default {${Object.keys(components)
					.map((name) => camelcase(name))
					.join(",")}}`;
			}
		},
	};
}
