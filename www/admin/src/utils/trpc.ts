import { env as envClient } from "@admin/src/env/client.mjs";
import { createTRPCProxyClient, httpBatchLink, httpLink } from "@trpc/client";
import type { AppRouter } from "api/trpc/routes/_app";
import SuperJSON from "superjson";

function getUrl() {
	return typeof window === "undefined" ? "http://localhost:4000/trpc" : "/admin/trpc";
}

export const trpc = createTRPCProxyClient<AppRouter>({
	links: [
		process.env.NODE_ENV === "development" || !!envClient.NEXT_PUBLIC_DEV
			? // Use httpLink in dev so tests work
			  httpLink({
					url: getUrl(),
			  })
			: httpBatchLink({
					url: getUrl(),
			  }),
	],
	transformer: SuperJSON,
});
