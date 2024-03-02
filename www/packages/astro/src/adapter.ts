import type { ClientConfigBase } from "@lavacms/core";
import type { AstroIntegration } from "astro";
import bridgeScript from "./bridge";
import { vitePluginLavaCmsComponents } from "./vite-plugin-lavacms-components";
import { vitePluginLavaCmsConfig } from "./vite-plugin-lavacms-config";

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

	/**
	 * Will display a fallback component when an Astro component
	 * isn't assigned to a CMS component instead of throwing an error
	 */
	enableFallbackComponent?: boolean;
}

export function lavaCmsAstro(config: ClientConfigAstro): AstroIntegration {
	return {
		name: "@lavacms/astro",
		hooks: {
			"astro:config:setup": ({ updateConfig, injectScript }) => {
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
					`,
				);

				if (process.env.NODE_ENV !== "production") {
					injectScript("page", bridgeScript);
				}

				updateConfig({
					vite: {
						plugins: [
							vitePluginLavaCmsConfig(config),
							vitePluginLavaCmsComponents(config.components),
						],
					},
				});
			},
			"astro:config:done": ({ setAdapter }) => {
				setAdapter({
					name: "@lavacms/astro",
					supportedAstroFeatures: {
						staticOutput: "stable",
						serverOutput: "unsupported",
						hybridOutput: "unsupported",
						assets: {
							supportKind: "stable",
							isSharpCompatible: true,
							isSquooshCompatible: true,
						},
						i18nDomains: "stable",
					},
				});
			},
		},
	};
}
