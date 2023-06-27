import { cookies } from "next/headers";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import SuperJSON from "superjson";
import type { AppRouter } from "@admin/src/trpc/routes/_app";
import { url } from "./server";
import "server-only";

export const trpc = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${url()}/admin/api/trpc`,
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
