import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import cors from "cors";
import { renderTrpcPanel } from "trpc-panel";
import { appRouter } from "@api/trpc/routes/_app";

!process.env.SKIP_ENV_VALIDATION && import("./env/server");

const app = express();
const PORT = 4000;

app.use(cors({ origin: "http://localhost:8080" }));
app.use(
	"/trpc",
	trpcExpress.createExpressMiddleware({
		router: appRouter,
	})
);

app.get("/trpcadmin", (_, res) =>
	res.send(renderTrpcPanel(appRouter, { url: "http://localhost:4000/trpc" }))
);

app.listen(PORT, () => console.info(`Listening on port ${PORT}...`));
