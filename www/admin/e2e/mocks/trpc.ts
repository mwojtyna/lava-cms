import { type App, PORT } from "api/server";

let server: ReturnType<App["listen"]> | null = null;

export async function start(app: App) {
	if (server) {
		throw new Error("Server already started!");
	}

	return new Promise<void>((resolve) => {
		server = app.listen(PORT, () => {
			console.log(`Listening on port ${PORT}...`);
			resolve();
		});
	});
}

export async function stop() {
	if (server) {
		await new Promise<void>((resolve) => {
			server!.close(() => {
				resolve();
				server = null;
				console.log("Server stopped");
			});
		});
	} else {
		throw new Error("Server not started!");
	}
}
