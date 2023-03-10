import type { App } from "@api/server";
import { createMiddleware } from "@mswjs/http-middleware";

export type MockHandler = Parameters<typeof createMiddleware>[0];

export function mock(app: App, ...handlers: MockHandler[]) {
	app.use(createMiddleware(...handlers));
}
