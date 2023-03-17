"use client";

import {
	LockClosedIcon,
	EnvelopeIcon,
	ExclamationCircleIcon,
	ArrowRightOnRectangleIcon,
	EyeIcon,
	EyeSlashIcon,
} from "@heroicons/react/24/outline";
import {
	Alert,
	Button,
	Group,
	Loader,
	PasswordInput,
	Stack,
	TextInput,
	Title,
} from "@mantine/core";
import { signIn } from "next-auth/react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import ThemeSwitch from "@admin/app/(components)/ThemeSwitch";

function SignInForm() {
	const router = useRouter();

	const inputSchema = z.object({
		email: z
			.string()
			.min(1, { message: "Please enter your e-mail address." })
			.email({ message: "The e-mail you provided is invalid." }),
		password: z.string().min(1, { message: "Please enter your password." }),
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
				message: "The credentials are invalid.",
			});
		} else {
			setError("root.invalidCredentials", {
				message: "Something went wrong. Try again later.",
			});
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md px-10">
			<Stack spacing="lg">
				<Title order={1} size="3.5rem" variant="gradient">
					Sign in
				</Title>

				{errors.root?.invalidCredentials && (
					<Alert
						color="red"
						variant="filled"
						icon={<ExclamationCircleIcon className="w-5" />}
					>
						{errors.root?.invalidCredentials.message}
					</Alert>
				)}

				<TextInput
					size="md"
					type="email"
					label="E-mail"
					placeholder="user@domain.com"
					{...register("email")}
					error={errors.email?.message}
					icon={<EnvelopeIcon className="w-5" />}
					autoFocus
				/>
				<PasswordInput
					size="md"
					label="Password"
					{...register("password")}
					error={errors.password?.message}
					icon={<LockClosedIcon className="w-5" />}
					visibilityToggleIcon={({ reveal, size }) =>
						reveal ? (
							<EyeSlashIcon style={{ width: size }} />
						) : (
							<EyeIcon style={{ width: size }} />
						)
					}
				/>

				<Group position="apart" spacing="lg">
					<ThemeSwitch />
					<Button
						size="md"
						type="submit"
						leftIcon={
							!isSubmitting &&
							!isSubmitSuccessful && <ArrowRightOnRectangleIcon className="w-5" />
						}
					>
						{isSubmitting ||
						(isSubmitSuccessful && !errors.root?.invalidCredentials) ? (
							<Loader variant="dots" color="#fff" />
						) : (
							<>Sign in</>
						)}
					</Button>
				</Group>
			</Stack>
		</form>
	);
}

export default SignInForm;
