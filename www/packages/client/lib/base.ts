/// Shared code between the adapters

import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import SuperJSON from "superjson";
import type { PublicRouter } from "@lavacms/types";

export interface ClientConfigBase {
	/**
	 * URL of your self-hosted CMS
	 * @example "https://lavacms.com/admin"
	 */
	url: string;
	/** Token copied from `Settings > Connection` */
	token: string;
	/** Log requests and responses to console */
	log?: boolean;
}

export class LavaCmsApiClient {
	protected readonly connection;

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
}

declare global {
	// eslint-disable-next-line no-var
	var client: LavaCmsApiClient | undefined;
}
export function useLavaCms(): LavaCmsApiClient {
	if (!globalThis.client) {
		throw new Error("Lava CMS client not initialized! Are you using the correct adapter?");
	} else {
		return globalThis.client;
	}
}
