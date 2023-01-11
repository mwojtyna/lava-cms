import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import cors from "cors";
import { appRouter } from "./trpc/routes/_app";

const app = express();
const PORT = 4000;

app.use(cors({ origin: "http://localhost:8080" }));
app.use(
	"/trpc",
	trpcExpress.createExpressMiddleware({
		router: appRouter
	})
);
app.listen(PORT, () => console.info(`Listening on port ${PORT}...`));
