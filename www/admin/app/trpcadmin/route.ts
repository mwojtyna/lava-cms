import { redirect } from "next/navigation";
import { renderTrpcPanel } from "trpc-panel";
import { getCurrentUser } from "@admin/src/auth";
import { privateRouter } from "@admin/src/trpc/routes/private/_private";

export const GET = async () => {
	if (await getCurrentUser()) {
		return new Response(
			renderTrpcPanel(privateRouter, {
				url: "/admin/api/private",
				transformer: "superjson",
			}),
			{
				headers: {
					"Content-Type": "text/html",
					"Cache-Control": "no-store",
				},
			},
		);
	} else {
		redirect("/admin/signin");
	}
};
