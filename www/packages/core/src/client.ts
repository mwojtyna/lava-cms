import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import SuperJSON from "superjson";
import type { PublicRouter } from "@lavacms/types";
import type { ClientConfigBase, LavaCmsComponentList } from "./types";

export class LavaCmsApiClient {
	private readonly connection;

	constructor(config: ClientConfigBase) {
		this.connection = createTRPCProxyClient<PublicRouter>({
			links: [
				loggerLink({ enabled: () => !!config.log }),
				httpBatchLink({
					url: config.url.replace(/\/$/, "") + "/api/public",
					headers: {
						Authorization: `Bearer ${config.token}`,
					},
				}),
			],
			transformer: SuperJSON,
		});
	}

	/**
	 * Configured in `Settings > SEO`
	 * @returns Selected HTML `<head>` tag properties
	 */
	public async getHead() {
		return await this.connection.getConfig.query();
	}

	/**
	 * @param path Path of the page to get. Recommended to use the [URL API](https://developer.mozilla.org/en-US/docs/Web/API/URL) `pathname` property
	 * @returns Page name and its components
	 */
	public async getPage(
		path: string
	): Promise<{ name: string; components: LavaCmsComponentList }> {
		const page = await this.connection.getPage.query({ path });

		if (!page) {
			throw new Error(`Page with path '${path}' not added in CMS!`);
		} else {
			const { name } = page;

			// TODO: Get from CMS
			const components: LavaCmsComponentList = [
				{
					name: "Card",
					component: {
						title: "Products",
						body: "Browse our products",
						href: "/products",
					},
				},
				{
					name: "Card",
					component: {
						title: "About",
						body: "Learn about our company",
						href: "/about",
					},
				},
			];

			return { name, components };
		}
	}
}

export function useLavaCms(): LavaCmsApiClient {
	if (!globalThis.client) {
		throw new Error(
			"Lava CMS client not initialized! Are you using the correct adapter for your framework?"
		);
	} else {
		return globalThis.client;
	}
}
