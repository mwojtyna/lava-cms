import type { inferAsyncReturnType } from "@trpc/server";
import type { Metadata } from "next";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { redirect } from "next/navigation";
import { Stepper } from "@/src/components/ui/server";
import { caller } from "@/src/trpc/routes/private/_private";
import { SetupForm } from "./SetupForm";
import { SignUpForm } from "./SignUpForm";

export const metadata: Metadata = {
	title: "Setup - Lava CMS",
};
export const dynamic = "force-dynamic";

const reasonFormMap: Record<
	NonNullable<inferAsyncReturnType<typeof caller.auth.setupRequired>["reason"]>,
	React.ReactNode
> = {
	"no-user": <SignUpForm />,
	"no-config": <SetupForm />,
};

export default async function SetupLayout() {
	const { reason } = await caller.auth.setupRequired();
	if (!reason) {
		redirect("/signin");
	}

	return (
		<div>
			<Stepper
				className="mb-2 ml-1"
				steps={["Admin account", "Configuration"]}
				currentStep={Object.keys(reasonFormMap).indexOf(reason)}
				separator={<ArrowRightIcon className="w-4" />}
			/>
			{reasonFormMap[reason]}
		</div>
	);
}
