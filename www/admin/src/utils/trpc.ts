import { cookies } from "next/headers";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@admin/src/trpc/routes/_app";
import SuperJSON from "superjson";
import "server-only";

export const trpc = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: "http://localhost:3001/admin/api/trpc",
			fetch: (url, options) =>
				fetch(url, {
					...options,
					headers: {
						...options?.headers,
						Cookie: cookies().toString(),
					},
					credentials: "include",
				}),
		}),
	],
	transformer: SuperJSON,
});
