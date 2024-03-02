import type { Page } from "@prisma/client";
import { z } from "zod";
import { displayNameRegex } from "@/src/utils/regex";
import { toPath } from "./utils";

export interface EditDialogProps {
	page: Page;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export interface BulkEditDialogProps {
	pages: Page[];
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	onSubmit: () => void;
}

export const editDialogSchema = z.object({
	name: z.string().regex(displayNameRegex, { message: " " }),
	slug: z
		.string({ required_error: " " })
		.min(1, { message: " " })
		.refine((slug) => toPath(slug) === slug, {
			message: "Invalid slug.",
		}),
});
export type EditDialogInputs = z.infer<typeof editDialogSchema>;
