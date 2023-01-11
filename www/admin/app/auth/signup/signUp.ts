import { client } from "api/trpc";
import type { User } from "api/prisma/types";

export async function signUp(data: User) {
	await client.signUp.mutate({
		name: data.name,
		lastName: data.last_name,
		email: data.email,
		password: data.password,
	});
}
