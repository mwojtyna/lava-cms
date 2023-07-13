import { env } from "../env/server.mjs";
import "server-only";

export const url = () => `${env.NODE_ENV === "production" ? "https" : "http"}://${env.VERCEL_URL}`;
