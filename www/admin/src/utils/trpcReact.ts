import { createTRPCReact } from "@trpc/react-query";
import type { PrivateRouter } from "@admin/src/trpc/routes/private/_private";
import "client-only";

export const trpcReact = createTRPCReact<PrivateRouter>({
	unstable_overrides: {
		useMutation: {
			onSuccess: async (opts) => {
				await opts.originalFn();
				await opts.queryClient.invalidateQueries();
			},
		},
	},
});
