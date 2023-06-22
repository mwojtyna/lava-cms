import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { trpc } from "@admin/src/utils/trpc";

export const authOptions: NextAuthOptions = {
	pages: {
		signIn: "/admin/signin",
	},
	session: {
		strategy: "jwt",
		maxAge: 7 * 24 * 60 * 60,
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.user = user;
			}
			return token;
		},
		async session({ session, token }) {
			session.user = token.user;
			return session;
		},
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
				const res = await trpc.auth.signIn.mutate({
					email: credentials!.email,
					password: credentials!.password,
				});

				if (!res) {
					// If you return null then an error will be displayed advising the user to check their details.
					return null;
				} else {
					// Any object returned will be saved in `user` property of the JWT
					return { id: res.userId };
				}
			},
		}),
	],
};

export default NextAuth(authOptions);
