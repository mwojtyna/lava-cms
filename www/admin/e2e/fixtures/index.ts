import { test as base, type APIRequestContext } from "@playwright/test";
import { authedPage, type AuthedPage } from "./authedPage";
import { authedRequest } from "./authedRequest";

export interface Fixtures {
	authedPage: AuthedPage;
	authedRequest: APIRequestContext;
}

export const test = base.extend<Fixtures>({
	authedPage,
	authedRequest,
});
