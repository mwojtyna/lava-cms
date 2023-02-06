import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { type TRPCError } from "@trpc/server";
import { trpc } from "@admin/src/utils/trpc";

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
				try {
					// Add logic here to look up the user from the credentials supplied
					const { userId } = await trpc.auth.signIn.mutate({
						email: credentials!.email,
						password: credentials!.password,
					});

					// Any object returned will be saved in `user` property of the JWT
					return {
						id: userId,
					};
				} catch (error: unknown | TRPCError) {
					const trpcError = error as TRPCError;

					// For some reason the error code is in the `message` property
					if ((trpcError.message as typeof trpcError.code) === "UNAUTHORIZED") {
						// If you return null then an error will be displayed advising the user to check their details.
						return null;
					} else {
						throw error;
					}
				}
			},
		}),
	],
};

export default NextAuth(authOptions);
