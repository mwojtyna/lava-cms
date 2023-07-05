import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { PublicRouter } from "@lavacms/types";
import SuperJSON from "superjson";

interface InitApiConfig {
	url: string;
	token: string;
}
export const initApi = (config: InitApiConfig) =>
	createTRPCProxyClient<PublicRouter>({
		links: [
			httpBatchLink({
				url: config.url,
				headers: {
					Authorization: `Bearer ${config.token}`,
				},
			}),
		],
		transformer: SuperJSON,
	});
