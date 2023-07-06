import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import type { PublicRouter } from "@lavacms/types";
import SuperJSON from "superjson";

interface InitApiConfig {
	url: string;
	token: string;
	log?: boolean;
}
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
