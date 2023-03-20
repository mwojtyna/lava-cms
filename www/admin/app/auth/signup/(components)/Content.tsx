"use client";

import { useState } from "react";
import { Stepper } from "@mantine/core";
import SignUpForm from "./SignUpForm";
import SetupForm from "./SetupForm";

export default function Content() {
	const [active, setActive] = useState(0);

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
