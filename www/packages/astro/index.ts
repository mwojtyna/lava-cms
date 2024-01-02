export { lavaCmsAstro } from "./src/adapter";
export { useLavaCms, ApiClient } from "@lavacms/core";

import type { CmsComponent as CmsComponentType } from "@lavacms/types";
export type CmsComponent = CmsComponentType | null;
