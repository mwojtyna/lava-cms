import { redirect } from "next/navigation";
import { renderTrpcPanel } from "trpc-panel";
import { validateRequest } from "@/src/auth";
import { privateRouter } from "@/src/trpc/routes/private/_private";

// NOTE: Doesn't work with turbopack
export const GET = async () => {
	const { session } = await validateRequest();
	if (session) {
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
