import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { renderTrpcPanel } from "trpc-panel";
import { appRouter } from "@api/trpc/routes/_app";
import { env } from "@api/env/server";
import { mock, type MockHandler } from "@api/server/mock";
import type { Express } from "express";

export type App = Express;
export let app: App;
export const PORT = 4000;

export async function init(mockHandlers?: MockHandler[]) {
	app = express();

	if (mockHandlers) {
		mock(app, ...mockHandlers);
	}

	const whiteList = ["http://localhost:8080", "http://localhost:3001", "http://localhost:3000"];
	app.use(
		cors({
			origin(requestOrigin, callback) {
				if (!requestOrigin) return callback(null, true);

				if (whiteList.includes(requestOrigin)) {
					callback(null, true);
				} else {
					callback(new Error("Not allowed by CORS"));
				}
			},
		})
	);

	app.use(
		"/trpc",
		createExpressMiddleware({
			router: appRouter,
		})
	);

	app.get("/trpcadmin", (_, res) => {
		if (env.NODE_ENV === "development") {
			res.send(renderTrpcPanel(appRouter, { url: "http://localhost:4000/trpc" }));
		}
	});

	return app;
}
