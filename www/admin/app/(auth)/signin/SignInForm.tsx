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
import { TypographyH1, Alert, AlertTitle } from "@admin/src/components/ui/server";
import { Input, Button } from "@admin/src/components/ui/client";
import { ThemeSwitch } from "@admin/src/components";

function SignInForm() {
	const router = useRouter();

	const inputSchema = z.object({
		email: z
			.string()
			.min(1, { message: " " })
			.email({ message: "The e-mail you provided is invalid." }),
		password: z.string().min(1),
	});
	type Inputs = z.infer<typeof inputSchema>;

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isSubmitSuccessful },
		setError,
	} = useForm<Inputs>({ mode: "onSubmit", resolver: zodResolver(inputSchema) });

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
		<form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md px-10">
			<div className="flex flex-col gap-5">
				<TypographyH1 className="mb-4">
					Sign in to{" "}
					<span className="bg-gradient-to-b from-orange-300 to-orange-600 bg-clip-text text-transparent">
						Lava
					</span>
				</TypographyH1>

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
					{...register("email")}
					error={errors.email?.message}
					icon={<EnvelopeIcon />}
					autoFocus
				/>

				<Input
					type="password"
					label="Password"
					{...register("password")}
					error={!!errors.password}
					icon={<LockClosedIcon />}
				/>

				<div className="flex items-center">
					<ThemeSwitch />
					<Button
						type="submit"
						icon={<ArrowRightOnRectangleIcon className="w-5" />}
						className="ml-auto shadow-lg shadow-primary/25"
						loading={isSubmitting || isSubmitSuccessful}
					>
						Sign in
					</Button>
				</div>
			</div>
		</form>
	);
}

export default SignInForm;
