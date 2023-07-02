import { cookies } from "next/headers";
import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import SuperJSON from "superjson";
import type { PrivateRouter } from "@admin/src/trpc/routes/private/_private";
import { url } from "./server";
import "server-only";

export const trpc = createTRPCProxyClient<PrivateRouter>({
	links: [
		loggerLink(),
		httpBatchLink({
			url: `${url()}/admin/api/private`,
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
