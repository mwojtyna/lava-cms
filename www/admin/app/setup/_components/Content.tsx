"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Stepper } from "@admin/src/components";
import SignUpForm from "../../../src/components/forms/SignUpForm";
const SetupForm = dynamic(() => import("./SetupForm"));

export default function Content({ stage }: { stage: number }) {
	const [active, setActive] = useState(stage);

	return (
		<Stepper
			active={active}
			breakpoint={"xs"}
			styles={{
				root: {
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: "2rem",
				},
				steps: {
					width: "100%",
				},
				content: {
					flexGrow: 1,
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
				},
			}}
		>
			<Stepper.Step label="Step 1" description="Sign up">
				<SignUpForm onSignUp={() => setActive(1)} />
			</Stepper.Step>
			{/* <Stepper.Step label="Step 2" description="Verify e-mail" /> */}
			<Stepper.Step label="Step 2" description="Setup website">
				<SetupForm />
			</Stepper.Step>
		</Stepper>
	);
}
