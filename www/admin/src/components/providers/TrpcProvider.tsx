"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import SuperJSON from "superjson";
import { trpc } from "@admin/src/utils/trpc";
import { env } from "@admin/src/env/client.mjs";

export function TrpcProvider({ children }: { children: React.ReactNode }) {
	const [trpcClient] = useState(
		trpc.createClient({
			links: [
				loggerLink({
					enabled: () => !!env.NEXT_PUBLIC_DEV,
				}),
				httpBatchLink({
					url: "/admin/api/private",
					fetch: (url, options) => fetch(url, { ...options, credentials: "include" }),
				}),
			],
			transformer: SuperJSON,
		})
	);
	const [queryClient] = useState(new QueryClient());

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</trpc.Provider>
	);
}
