import { redirect } from "next/navigation";
import { getCurrentUser } from "@admin/src/auth";
import { appRouter } from "@admin/src/trpc/routes/_app";
import { renderTrpcPanel } from "trpc-panel";

export const GET = async () => {
	if (await getCurrentUser()) {
		return new Response(
			renderTrpcPanel(appRouter, {
				url: "http://localhost:3001/admin/api/trpc",
				transformer: "superjson",
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "text/html",
					"Cache-Control": "no-store",
				},
			}
		);
	} else {
		redirect("/admin/signin");
	}
};
