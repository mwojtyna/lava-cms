import type { Page } from "playwright";
import { test as base } from "@playwright/test";
import { authedPage } from "./authedPage";

export interface Fixtures {
	authedPage: Page;
}

export const test = base.extend<Fixtures>({
	authedPage: authedPage,
});
