import { router } from "@api/trpc";
import { addPage } from "./addPage";
import { getPage } from "./getPage";
import { getPages } from "./getPages";
import { editPage } from "./editPage";

export const pagesRouter = router({
	addPage,
	getPage,
	getPages,
	editPage,
});

export type PagesRouter = typeof pagesRouter;
