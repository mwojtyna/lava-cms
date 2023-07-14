/// <reference types="lucia" />

declare namespace Lucia {
	type Auth = import("@admin/src/auth").Auth;

	type DatabaseUserAttributes = {
		name: string;
		last_name: string;
		email: string;
	};
}
