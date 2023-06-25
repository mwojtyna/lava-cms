import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@admin/src/trpc/routes/_app";
import SuperJSON from "superjson";
import { env } from "@admin/src/env/server.mjs";

export const trpc = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: "http://localhost:3001/admin/api/trpc",
			headers: () => {
				if (typeof window === "undefined") {
					return {
						"x-ssr-token": env.NEXTAUTH_SECRET,
					};
				} else {
					return {};
				}
			},
		}),
	],
	transformer: SuperJSON,
});
