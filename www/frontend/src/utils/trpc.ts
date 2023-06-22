import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "api/trpc/routes/_app";
import SuperJSON from "superjson";

export const trpc = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `http://localhost:4000/trpc`,
		}),
	],
	transformer: SuperJSON,
});
