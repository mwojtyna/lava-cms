import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import SuperJSON from "superjson";
import type { PublicRouter } from "@lavacms/types";
import type { ClientConfigBase, Component } from "./types";

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
		return await this.connection.getConfig.query();
	}

	/**
	 * @param path Path of the page. Recommended to use the [URL API](https://developer.mozilla.org/en-US/docs/Web/API/URL) `pathname` property
	 * @returns Page name and its components
	 */
	public async getPage(path: string): Promise<{ name: string; components: Component[] }> {
		const page = await this.connection.getPage.query({ path });
		if (!page) {
			throw new Error(`Page with path \`${path}\` not found in CMS`);
		}

		const { name } = page;

		// TODO: Get from CMS
		const components: Component[] = [
			{
				name: "Card",
				data: {
					title: "Home",
					body: "This is the home page",
					href: "/",
				},
			},
			{
				name: "Parent Card",
				data: {
					title: "Products",
					body: "Browse our products",
					href: "/products",
					children: [
						{
							name: "Card",
							data: {
								title: "Product 1",
								body: "This is a product",
								href: "/products/product-1",
							},
						},
						{
							name: "Card",
							data: {
								title: "Product 2",
								body: "This is a product",
								href: "/products/product-2",
							},
						},
						{
							name: "Card",
							data: {
								title: "Product 3",
								body: "This is a product",
								href: "/products/product-3",
							},
						},
						{
							name: "Parent card",
							data: {
								title: "Category 1",
								body: "This is a category",
								href: "/products/category-1",
								children: [
									{
										name: "Card",
										data: {
											title: "Product 1",
											body: "This is a product",
											href: "/products/category-1/product-1",
										},
									},
									{
										name: "Card",
										data: {
											title: "Product 2",
											body: "This is a product",
											href: "/products/category-1/product-2",
										},
									},
									{
										name: "Card",
										data: {
											title: "Product 3",
											body: "This is a product",
											href: "/products/category-1/product-3",
										},
									},
								],
							},
						},
					] satisfies Component[],
				},
			},
		];

		return { name, components };
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
			"Lava CMS client not initialized! Are you using the correct adapter for your framework?"
		);
	} else {
		return globalThis.client;
	}
}
