import { type App } from "@api/server";
import { createMiddleware } from "@mswjs/http-middleware";

export function mock(handlers: Parameters<typeof createMiddleware>[0], app: App) {
	app.use(createMiddleware(handlers));
}
