"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { useState } from "react";
import superjson from "superjson";
import { env } from "@admin/src/env/client.mjs";
import { trpc } from "@admin/src/utils/trpc";

export function TrpcProvider({ children }: { children: React.ReactNode }) {
	const [trpcClient] = useState(
		trpc.createClient({
			links: [
				loggerLink({ enabled: () => !!env.NEXT_PUBLIC_DEV }),
				httpBatchLink({
					url: "/admin/api/private",
				}),
			],
			transformer: superjson,
		}),
	);
	const [queryClient] = useState(
		new QueryClient({
			defaultOptions: {
				queries: {
					refetchOnWindowFocus: false,
				},
			},
		}),
	);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</trpc.Provider>
	);
}
