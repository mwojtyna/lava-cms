import type { ClientConfigBase } from "./types";
import type { CmsPage, PublicRouter } from "@lavacms/types";
import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import { SuperJSON } from "superjson";

export class ApiClient {
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
		return await this.connection.getHead.query();
	}

	/**
	 * @param path Path of the page. Recommended to use the [URL API](https://developer.mozilla.org/en-US/docs/Web/API/URL) `pathname` property
	 * @returns Page name and its components
	 */
	public async getPage(path: string): Promise<CmsPage> {
		const page = await this.connection.getPage.query({ path });
		if (!page) {
			throw new Error(`Page with path \`${path}\` not found in CMS`);
		}

		return page;
	}

	/**
	 * Returns slugs of specified group's pages. Useful for statically generating dynamic routes
	 * @param groupUrl URL of the CMS page group
	 * @returns Slugs of the pages in the group
	 * @example getPaths("/products") -> ["product-1", "product-2", "product-3"]
	 */
	public async getPaths(groupUrl: string): Promise<string[]> {
		try {
			return await this.connection.getPaths.query({ groupUrl });
		} catch (error) {
			throw new Error(`Group with URL \`${groupUrl}\` not found`);
		}
	}
}

export function useLavaCms(): ApiClient {
	if (!globalThis.client) {
		throw new Error(
			"Lava CMS client not initialized! Are you using the correct adapter for your framework?",
		);
	} else {
		return globalThis.client;
	}
}
