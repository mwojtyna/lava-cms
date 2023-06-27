/* eslint-disable @typescript-eslint/consistent-type-imports */
/// <reference types="lucia" />

declare namespace Lucia {
	type Auth = import("@admin/src/auth").Auth;

	type UserAttributes = {
		name: string;
		last_name: string;
		email: string;
	};
}
