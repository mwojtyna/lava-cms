import type { AstroIntegration } from "astro";
import type { LavaCms } from "@lavacms/core";
import { vitePluginLavaCmsComponents } from "./vite-plugin-lavacms-components";
import { vitePluginLavaCmsConfig } from "./vite-plugin-lavacms-config";

export interface ClientConfigAstro extends LavaCms.ClientConfigBase {
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

	/**
	 * Will display a fallback component when an Astro component
	 * isn't assigned to a CMS component instead of throwing an error
	 */
	enableFallbackComponent?: boolean;
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
					import { ApiClient } from "@lavacms/astro";
					const client = new ApiClient({
						url: "${config.url}",
						token: "${config.token}",
						log: ${config.log ? "true" : "false"},
					});
					globalThis.client = client;
					`
				);

				updateConfig({
					vite: {
						plugins: [
							vitePluginLavaCmsConfig(config),
							vitePluginLavaCmsComponents(config.components),
						],
					},
				});
			},
		},
	};
}
