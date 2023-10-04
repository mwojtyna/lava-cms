import Link from "next/link";
import { ActionIcon } from "@admin/src/components/ui/client";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { UserMenu } from "@admin/src/components/UserMenu";

export function TopBar() {
	return (
		<nav className="flex w-full items-center justify-between border-b border-border p-5 py-3">
			<Link href={"/dashboard"}>
				<ActionIcon variant={"outline"} aria-label="Go back to dashboard">
					<ArrowUturnLeftIcon className="w-5" />
				</ActionIcon>
			</Link>

			<UserMenu />
		</nav>
	);
}
