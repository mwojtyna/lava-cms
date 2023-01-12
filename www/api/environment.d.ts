declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PORT: number;
			NODE_ENV: "development" | "production";
		}
	}
}

// Required for type definition to work
export {};
