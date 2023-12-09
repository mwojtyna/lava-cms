import { router } from "@admin/src/trpc";
import { addComponentDefinition } from "./addComponentDefinition";
import { editComponentDefinition } from "./editComponentDefinition";
import { deleteComponentDefinition } from "./deleteComponentDefinition";
import { addGroup } from "./addGroup";
import { editGroup } from "./editGroup";
import { deleteGroup } from "./deleteGroup";
import { getAllGroups } from "./getAllGroups";
import { getGroup } from "./getGroup";
import { addComponent } from "./addComponent";

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
