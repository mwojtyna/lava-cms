import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@frontend/../admin/src/trpc/routes/_app";
import SuperJSON from "superjson";

export const trpc = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: "http://localhost:3001/admin/api/trpc",
			headers: {
				"x-trpc-origin": "server",
			},
		}),
	],
	transformer: SuperJSON,
});
