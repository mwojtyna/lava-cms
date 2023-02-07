import { createTRPCMsw } from "msw-trpc";
import type { AppRouter } from "api/trpc/routes/_app";
import { createHttpTerminator, type HttpTerminator } from "http-terminator";
import { type App, PORT } from "api/server";

export const trpcMsw = createTRPCMsw<AppRouter>();

let server: HttpTerminator | null = null;
export async function start(app: App) {
	if (server) {
		throw new Error("Server already started!");
	}

	return new Promise<void>((resolve) => {
		server = createHttpTerminator({
			server: app.listen(PORT, () => {
				console.log(`Mocking on port ${PORT}...`);
				resolve();
			}),
		});
	});
}
export async function stop() {
	if (server) {
		await server.terminate();
		server = null;
		console.log("Mocking stopped");
	}
}
