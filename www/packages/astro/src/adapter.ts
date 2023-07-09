import type { AstroIntegration } from "astro";
import type { ClientConfigBase } from "@lavacms/core";
import { vitePluginLavaCmsComponents } from "./vite-plugin-lavacms-components";

export interface ClientConfigAstro extends ClientConfigBase {
	/**
	 * Assign CMS component name to an Astro component path
	 * @example
	 * ```ts
	 * components: {
	 *     Hero: "/src/components/Hero.astro",
	 *     Features: "/src/components/Features.astro",
	 *     Testimonials: "/src/components/Testimonials.astro",
	 *     "Nav-Footer": "/src/components/Footer.astro"
	 * }
	 * ```
	 */
	components: Record<string, string>;
}

export function lavaCmsAstro(config: ClientConfigAstro): AstroIntegration {
	return {
		name: "lava-cms",
		hooks: {
			"astro:config:setup": ({ updateConfig, injectScript, config: astroConfig }) => {
				if (astroConfig.output !== "static") {
					injectScript(
						"page-ssr",
						`throw new Error("Lava CMS Astro adapter doesn't support SSR!");`
					);
					return;
				}

				injectScript(
					"page-ssr",
					`
					import { LavaCmsApiClient } from "@lavacms/astro";
					const client = new LavaCmsApiClient({
						url: "${config.url}",
						token: "${config.token}",
						log: ${config.log ? "true" : "false"},
					});
					globalThis.client = client;
					`
				);

				updateConfig({
					vite: {
						plugins: [vitePluginLavaCmsComponents(config.components)],
					},
				});
			},
		},
	};
}
