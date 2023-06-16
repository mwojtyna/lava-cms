import { test as base, type Page } from "@playwright/test";
import { authedPage } from "./authedPage";

export interface Fixtures {
	authedPage: Page;
}

export const test = base.extend<Fixtures>({
	authedPage: authedPage,
});
