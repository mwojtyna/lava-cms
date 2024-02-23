import type { Page } from "@prisma/client";
import slugify from "slugify";
import { z } from "zod";
import { slugifyOptions } from "./utils";

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
	name: z.string().min(1),
	slug: z
		.string({ required_error: " " })
		.min(1, { message: " " })
		.refine((slug) => "/" + slugify(slug, slugifyOptions) === slug, {
			message: "Invalid slug.",
		}),
});
export type EditDialogInputs = z.infer<typeof editDialogSchema>;
