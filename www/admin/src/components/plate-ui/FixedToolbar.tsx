import { withCn } from "@udecode/cn";

import { Toolbar } from "./Toolbar";

export const FixedToolbar = withCn(
	Toolbar,
	"supports-backdrop-blur:bg-background/60 sticky left-0 -top-[17px] z-50 w-full justify-between overflow-x-auto rounded-t-lg border border-border bg-background/95 backdrop-blur",
);
