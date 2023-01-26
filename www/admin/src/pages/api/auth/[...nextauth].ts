import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { trpc } from "@admin/src/utils/trpc";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type TRPCError } from "@trpc/server";

export const authOptions: NextAuthOptions = {
	pages: {
		signIn: "/admin/auth/signin",
		signOut: "/admin/auth/signout",
	},
	session: {
		strategy: "jwt",
		maxAge: 7 * 24 * 60 * 60,
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
				try {
					const userId = await trpc.auth.signIn.mutate({
						email: credentials!.email,
						password: credentials!.password,
					});

					// Any object returned will be saved in `user` property of the JWT
					return {
						id: userId,
					};
				} catch (error: TRPCError | unknown) {
					throw error;
				}
			},
		}),
	],
};

export default NextAuth(authOptions);
