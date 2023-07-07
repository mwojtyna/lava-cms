import type { AstroIntegration } from "astro";
import type { ClientConfigBase } from "../base";

export interface ClientConfigAstro extends ClientConfigBase {
	/** Docs */
	components: Record<string, string>;
}

export function lavaCmsAstro(config: ClientConfigAstro): AstroIntegration {
	return {
		name: "lava-cms",
		hooks: {
			"astro:config:setup": ({ injectScript }) => {
				injectScript(
					"page-ssr",
					`
					import { LavaCmsApiClient } from "@lavacms/client";
					const client = new LavaCmsApiClient({
						url: "${config.url}",
						token: "${config.token}",
						log: ${config.log ? "true" : "false"},
					});
					globalThis.client = client;
					`
				);
			},
		},
	};
}
