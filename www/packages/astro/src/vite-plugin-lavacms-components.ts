import type { Plugin } from "vite";
import camelcase from "camelcase";
import type { ClientConfigAstro } from "./adapter";

export function vitePluginLavaCmsComponents(components: ClientConfigAstro["components"]): Plugin {
	const virtualModuleId = "virtual:lavacms-components";
	const resolvedVirtualModuleId = "\0" + virtualModuleId;

	return {
		name: "lavacms-components",
		// @ts-expect-error - not all code paths return a value
		resolveId: (id) => {
			if (id === virtualModuleId) {
				return resolvedVirtualModuleId;
			}
		},
		// @ts-expect-error - not all code paths return a value
		async load(id) {
			if (id === resolvedVirtualModuleId) {
				const imports: string[] = [];

				for (const [name, path] of Object.entries(components)) {
					const resolvedId = await this.resolve(path);

					if (!resolvedId) {
						throw new Error(
							`Astro component could not be found for CMS component "${name}"! Does "${path}" exist?`
						);
					} else {
						imports.push(`import ${camelcase(name)} from "${resolvedId.id}"`);
					}
				}

				if (!Object.values(components).length) {
					throw new Error(`No CMS components are registered in astro.config.mjs.`);
				} else {
					return `${imports.join(";")}; export default {${Object.keys(components)
						.map((name) => camelcase(name))
						.join(",")}}`;
				}
			}
		},
	};
}