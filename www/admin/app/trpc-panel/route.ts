import { redirect } from "next/navigation";
import { getCurrentUser } from "@admin/src/auth";
import { privateRouter } from "@admin/src/trpc/routes/private/_private";
import { renderTrpcPanel } from "trpc-panel";

export const GET = async () => {
	if (await getCurrentUser()) {
		return new Response(
			renderTrpcPanel(privateRouter, {
				url: "/admin/api/private",
				transformer: "superjson",
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "text/html",
					"Cache-Control": "no-store",
				},
			},
		);
	} else {
		redirect("/signin");
	}
};
