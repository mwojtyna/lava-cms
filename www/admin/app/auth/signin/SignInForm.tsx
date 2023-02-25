"use client";

import { LockClosedIcon, EnvelopeIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
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

function SignUpForm() {
	const router = useRouter();

	const inputSchema = z.object({
		email: z
			.string()
			.min(1, { message: "E-mail jest wymagany" })
			.email({ message: "Niepoprawny adres e-mail" }),
		password: z.string().min(1, { message: "Hasło jest wymagane" }),
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
				message: "Niepoprawne dane!",
			});
		} else {
			setError("root.invalidCredentials", {
				message: "Nieznany błąd. Spróbuj ponownie później.",
			});
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Stack spacing="lg" className="w-96">
				<Title order={1} size="3.5rem" variant="gradient">
					Zaloguj się
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
					label="Hasło"
					{...register("password")}
					error={errors.password?.message}
					icon={<LockClosedIcon className="w-5" />}
				/>

				<Group position="right" spacing="lg">
					<Button size="md" type="submit">
						{isSubmitting ||
						(isSubmitSuccessful && !errors.root?.invalidCredentials) ? (
							<Loader variant="dots" color="#fff" />
						) : (
							<>Zaloguj się</>
						)}
					</Button>
				</Group>
			</Stack>
		</form>
	);
}

export default SignUpForm;
