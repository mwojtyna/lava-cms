import { router } from "@api/trpc";
import { addPage } from "./addPage";
import { getPage } from "./getPage";
import { editPage } from "./editPage";
import { deletePage } from "./deletePage";
import { movePage } from "./movePage";
import { getGroupContents } from "./getGroupContents";
import { getGroup } from "./getGroup";
import { getAllGroups } from "./getAllGroups";

export const pagesRouter = router({
	addPage,
	getPage,
	editPage,
	deletePage,
	movePage,
	getGroupContents,
	getGroup,
	getAllGroups,
});

export type PagesRouter = typeof pagesRouter;
