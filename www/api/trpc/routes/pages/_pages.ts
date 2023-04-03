import { router } from "@api/trpc";
import { addPage } from "./addPage";
import { getPage } from "./getPage";

export const pagesRouter = router({
	addPage,
	getPage,
});

export type PagesRouter = typeof pagesRouter;
