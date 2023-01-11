import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { client } from "api/trpc";

export const authOptions: NextAuthOptions = {
	pages: {
		signIn: "/admin/auth/signin",
		signOut: "/admin/auth/signout",
	},
	providers: [
		CredentialsProvider({
			credentials: {
				email: {
					label: "Email",
					type: "email",
				},
				password: { label: "Password", type: "password" },
			},
			authorize: async (credentials) => {
				// Add logic here to look up the user from the credentials supplied
				const res = await client.signIn.mutate({
					email: credentials!.email,
					password: credentials!.password,
				});

				if (!res.error && res.user) {
					// Any object returned will be saved in `user` property of the JWT
					return {
						id: res.user.id.toString(),
						email: res.user.email,
						password: res.user.password,
					} as typeof credentials & { id: string };
				} else if (res.error !== "unknown") {
					// You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
					// If you return null then an error will be displayed advising the user to check their details.
					throw new Error(res.error);
				}

				return null;
			},
		}),
	],
};

export default NextAuth(authOptions);
