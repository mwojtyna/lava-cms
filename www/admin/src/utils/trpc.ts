import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "api/trpc/routes/_app";
import SuperJSON from "superjson";

const getUrl = () => (typeof window === "undefined" ? "http://localhost:4000/trpc" : "/admin/trpc");

export const trpc = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: getUrl(),
		}),
	],
	transformer: SuperJSON,
});
