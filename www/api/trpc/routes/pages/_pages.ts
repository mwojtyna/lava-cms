import { router } from "@api/trpc";
import { addPage } from "./addPage";
import { getPage } from "./getPage";
import { editPage } from "./editPage";
import { deletePage } from "./deletePage";
import { movePage } from "./movePage";
import { getGroupContents } from "./getGroupContents";
import { getGroup } from "./getGroup";
import { getAllGroups } from "./getAllGroups";
import { checkConflict } from "./checkConflict";

export const pagesRouter = router({
	addPage,
	checkConflict,
	deletePage,
	getPage,
	editPage,
	getAllGroups,
	getGroup,
	getGroupContents,
	movePage,
});

export type PagesRouter = typeof pagesRouter;
