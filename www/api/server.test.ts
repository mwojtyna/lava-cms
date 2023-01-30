import { it, expect, vi, describe, afterEach } from "vitest";
import request from "supertest";
import { init, App } from "@api/server";
import { env, reload } from "@api/env/server";

describe("/trpcadmin", async () => {
	let app: App | null = null;
	let server: ReturnType<App["listen"]> | null = null;

	async function start() {
		app = await init();
		return new Promise<void>((resolve) => {
			server = app!.listen(0, () => {
				resolve();
			});
		});
	}
	async function stop() {
		await new Promise<void>((resolve) => {
			server!.close(() => {
				resolve();
			});
		});

		server = null;
		app = null;
	}

	afterEach(async () => {
		vi.unstubAllEnvs();
		await stop();
	});

	it("opens /trpcadmin when NODE_ENV=development", async () => {
		vi.stubEnv("NODE_ENV", "development");
		reload();
		expect(env.NODE_ENV).toBe("development");

		await start();
		const res = await request(app).get("/trpcadmin");
		expect(res.statusCode).toBe(200);
	});

	it("fails to open /trpcadmin when NODE_ENV=production", async () => {
		vi.stubEnv("NODE_ENV", "production");
		reload();
		expect(env.NODE_ENV).toBe("production");

		await start();
		const res = request(app).connect("/trpcadmin");

		// Can't use string because even if a part of it is contained
		// in the error message, then the expression evaluates to true
		await expect(res).rejects.toThrow(/^socket hang up$/);
	});
});
