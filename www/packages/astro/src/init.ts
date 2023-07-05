import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { PublicRouter } from "./types";
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
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		transformer: SuperJSON,
	});
