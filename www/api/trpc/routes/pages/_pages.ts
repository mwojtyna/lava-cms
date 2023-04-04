import { router } from "@api/trpc";
import { addPage } from "./addPage";
import { getPage } from "./getPage";
import { getPages } from "./getPages";

export const pagesRouter = router({
	addPage,
	getPage,
	getPages,
});

export type PagesRouter = typeof pagesRouter;
