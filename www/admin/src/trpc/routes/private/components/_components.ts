import { router } from "@admin/src/trpc";
import { addComponent } from "./addComponent";
import { addComponentDefinition } from "./addComponentDefinition";
import { addGroup } from "./addGroup";
import { deleteComponentDefinition } from "./deleteComponentDefinition";
import { deleteGroup } from "./deleteGroup";
import { editComponentDefinition } from "./editComponentDefinition";
import { editGroup } from "./editGroup";
import { getAllGroups } from "./getAllGroups";
import { getGroup } from "./getGroup";

export const componentsRouter = router({
	addComponentDefinition,
	editComponentDefinition,
	deleteComponentDefinition,
	addGroup,
	editGroup,
	deleteGroup,
	getAllGroups,
	getGroup,
	addComponent,
});
