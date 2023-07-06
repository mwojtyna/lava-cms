import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import type { PublicRouter } from "@lavacms/types";
import SuperJSON from "superjson";

interface InitApiConfig {
	/**
	 * Base URL of your self-hosted CMS
	 * @example "https://lavacms.com/admin"
	 */
	url: string;
	/** Token copied from your CMS connection settings page */
	token: string;
	/** Log requests and responses to console */
	log?: boolean;
}

/**
 * Initialize the connection to your CMS
 * @returns A TRPC client that can be used to make requests to your CMS
 */
export const initApi = (config: InitApiConfig) =>
	createTRPCProxyClient<PublicRouter>({
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
