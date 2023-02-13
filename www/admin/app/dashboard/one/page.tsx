import { getServerSession } from "next-auth";
import { authOptions } from "@admin/src/pages/api/auth/[...nextauth]";
import { trpc } from "@admin/src/utils/trpc";

async function One() {
	const { greeting } = await trpc.auth.greeting.query({ name: "T3 App" });
	const session = await getServerSession(authOptions);

	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
			<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
				<h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
					<span className="text-[hsl(280,100%,70%)]">{greeting}</span>
				</h1>
				<pre className="text-[hsl(280,100%,70%)]">{JSON.stringify(session, null, 2)}</pre>
			</div>
		</main>
	);
}

export default One;
