import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import { appRouter } from "./trpc/routers/_app";

const app = express();
const PORT = 4000;

app.use(
	"/trpc",
	trpcExpress.createExpressMiddleware({
		router: appRouter
	})
);
app.listen(PORT, () => console.info(`Listening on port ${PORT}...`));
