declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PORT: number;
		}
	}
}

// Required for type definition to work
export {};
