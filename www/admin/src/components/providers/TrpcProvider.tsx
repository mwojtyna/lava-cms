"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import SuperJSON from "superjson";
import { trpcReact } from "@admin/src/utils/trpcReact";
import { env } from "@admin/src/env/client.mjs";

export function TrpcProvider(props: { children: React.ReactNode }) {
	const [queryClient] = useState(new QueryClient());
	const [trpcClient] = useState(
		trpcReact.createClient({
			links: [
				loggerLink({
					enabled: () => !!env.NEXT_PUBLIC_DEV,
				}),
				httpBatchLink({
					url: "/admin/api/trpc",
					fetch: (url, options) => fetch(url, { ...options, credentials: "include" }),
				}),
			],
			transformer: SuperJSON,
		})
	);

	return (
		<trpcReact.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
		</trpcReact.Provider>
	);
}
