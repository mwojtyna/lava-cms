"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { useState } from "react";
import superjson from "superjson";
import { env } from "@/src/env/client.mjs";
import { useToast } from "@/src/hooks/useToast";
import { trpc } from "@/src/utils/trpc";

export function TrpcProvider({ children }: { children: React.ReactNode }) {
	const { toastError } = useToast();

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
			queryCache: new QueryCache({
				onError: (_, query) => {
					if (query.meta?.errorMessage) {
						toastError({
							title: "Error",
							description: query.meta.errorMessage as string,
						});
					}
				},
			}),
			mutationCache: new MutationCache({
				onError: (_, __, ___, mutation) => {
					if (mutation.meta?.errorMessage) {
						toastError({
							title: "Error",
							description: mutation.meta.errorMessage as string,
						});
					}
				},
			}),
		}),
	);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</trpc.Provider>
	);
}
