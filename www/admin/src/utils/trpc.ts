import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCProxyClient, createTRPCReact } from "@trpc/react-query";
import { SuperJSON } from "superjson";
import { env } from "@/src/env/client.mjs";
import type { PrivateRouter } from "@/src/trpc/routes/private/_private";
import "client-only";

export interface Meta {
	noInvalidate?: boolean;
}

export const trpc = createTRPCReact<PrivateRouter>({
	overrides: {
		useMutation: {
			onSuccess: async (opts) => {
				await opts.originalFn();
				const meta = opts.meta as Meta;
				if (!meta.noInvalidate) {
					await opts.queryClient.invalidateQueries();
				}
			},
		},
	},
});

export const trpcFetch = createTRPCProxyClient<PrivateRouter>({
	links: [
		loggerLink({ enabled: () => !!env.NEXT_PUBLIC_DEV }),
		httpBatchLink({
			url: "/admin/api/private",
		}),
	],
	transformer: SuperJSON,
});
