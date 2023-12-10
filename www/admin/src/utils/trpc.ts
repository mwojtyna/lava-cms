import { createTRPCReact } from "@trpc/react-query";
import type { PrivateRouter } from "@/src/trpc/routes/private/_private";
import "client-only";

export const trpc = createTRPCReact<PrivateRouter>({
	overrides: {
		useMutation: {
			onSuccess: async (opts) => {
				await opts.originalFn();
				await opts.queryClient.invalidateQueries();
			},
		},
	},
});
