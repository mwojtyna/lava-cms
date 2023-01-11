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
				const user = await client.signIn.mutate({
					email: credentials!.email,
					password: credentials!.password,
				});

				if (!user.error) {
					// Any object returned will be saved in `user` property of the JWT
					return {
						id: "1",
						email: user.email,
						password: user.password,
					} as typeof credentials & { id: string };
				} else if (user.error !== "unknown") {
					// You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
					// If you return null then an error will be displayed advising the user to check their details.
					throw new Error(user.error);
				}

				return null;
			},
		}),
	],
};

export default NextAuth(authOptions);
