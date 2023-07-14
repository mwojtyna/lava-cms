import { test as base, type APIRequestContext, type Page } from "@playwright/test";
import { authedPage } from "./authedPage";
import { authedRequest } from "./authedRequest";

export interface Fixtures {
	authedPage: Page;
	authedRequest: APIRequestContext;
}

export const test = base.extend<Fixtures>({
	authedPage,
	authedRequest,
});
