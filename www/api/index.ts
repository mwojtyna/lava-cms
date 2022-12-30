import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import { appRouter } from "./trpc/routers/_app";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(
	"/trpc",
	trpcExpress.createExpressMiddleware({
		router: appRouter
	})
);
app.listen(process.env.PORT, () => console.info(`Listening on port ${process.env.PORT}...`));
