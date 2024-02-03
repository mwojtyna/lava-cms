import type { inferRouterOutputs } from "@trpc/server";
import type { PrivateRouter } from "@/src/trpc/routes/private/_private";

export type Component =
	inferRouterOutputs<PrivateRouter>["pages"]["getPageComponents"]["components"][number];

/** Message sent from page editor to iframe */
export type PageEditorMessage = {
	name: "init" | "update";
};

/** Message sent from iframe to page editor */
export type IframeMessage = {
	name: "urlChanged";
	url: string;
};
