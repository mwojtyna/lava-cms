"use client";

import {
	LockClosedIcon,
	EnvelopeIcon,
	ExclamationCircleIcon,
	ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { signIn } from "next-auth/react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Alert, AlertTitle } from "@admin/src/components/ui/server";
import { Input, Button } from "@admin/src/components/ui/client";
import { SinglePageForm } from "../SinglePageForm";

const schema = z.object({
	email: z
		.string()
		.min(1, { message: " " })
		.email({ message: "The e-mail you provided is invalid." }),
	password: z.string().min(1),
});
type Inputs = z.infer<typeof schema>;

export function SignInForm() {
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isSubmitSuccessful },
		setError,
	} = useForm<Inputs>({ resolver: zodResolver(schema) });

	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		const res = await signIn("credentials", {
			redirect: false,
			...data,
		});

		if (res?.ok) {
			router.push("/dashboard");
		} else if (res?.error === "CredentialsSignin") {
			// "CredentialsSignin" is the error message when the user inputs wrong credentials
			setError("root.invalidCredentials", {
				message: "Your credentials are invalid.",
			});
		} else {
			setError("root.invalidCredentials", {
				message: "Something went wrong. Try again later.",
			});
		}
	};

	return (
		<SinglePageForm
			onSubmit={handleSubmit(onSubmit)}
			className="max-w-sm"
			titleText={
				<>
					<span className="bg-gradient-to-b from-foreground/70 to-foreground bg-clip-text text-transparent dark:bg-gradient-to-t">
						Sign in to{" "}
					</span>
					<span className="bg-gradient-to-b from-orange-300 to-orange-600 bg-clip-text text-transparent">
						Lava
					</span>
				</>
			}
			submitButton={
				<Button
					type="submit"
					size="lg"
					icon={<ArrowRightOnRectangleIcon className="w-5" />}
					className="ml-auto shadow-lg shadow-primary/25"
					loading={isSubmitting || isSubmitSuccessful}
				>
					Sign in
				</Button>
			}
		>
			{errors.root?.invalidCredentials && (
				<Alert variant="destructive" icon={<ExclamationCircleIcon className="w-5" />}>
					<AlertTitle className="mb-0">
						{errors.root?.invalidCredentials.message}
					</AlertTitle>
				</Alert>
			)}

			<Input
				type="email"
				label="E-mail"
				placeholder="user@domain.com"
				size="lg"
				{...register("email")}
				error={errors.email?.message}
				icon={<EnvelopeIcon />}
				autoFocus
			/>

			<Input
				type="password"
				label="Password"
				size="lg"
				{...register("password")}
				error={!!errors.password}
				icon={<LockClosedIcon />}
			/>
		</SinglePageForm>
	);
}
