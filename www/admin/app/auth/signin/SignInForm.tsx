"use client";

import { useState } from "react";
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
import { useRouter } from "next/navigation";

function SignUpForm() {
	const router = useRouter();
	const [signInError, setSignInError] = useState<string | null>(null);

	interface Inputs {
		email: string;
		password: string;
	}

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isSubmitSuccessful },
	} = useForm<Inputs>({ mode: "onChange" });

	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		setSignInError(null);
		const res = await signIn("credentials", {
			redirect: false,
			...data,
		});

		if (res?.ok) {
			router.push("/admin/dashboard");
		} else if (res?.error === "CredentialsSignin") {
			// "CredentialsSignin" is the error message when the user inputs wrong credentials
			setSignInError("Niepoprawne dane!");
		} else {
			setSignInError("Nieznany błąd. Spróbuj ponownie później.");
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Stack spacing="lg" className="w-96">
				<Title order={1} size="3.5rem" variant="gradient">
					Zaloguj się
				</Title>

				{signInError && (
					<Alert color="red" variant="filled" icon={<ExclamationCircleIcon />}>
						{signInError}
					</Alert>
				)}

				<TextInput
					size="md"
					type="email"
					label="E-mail"
					placeholder="user@domain.com"
					{...register("email", {
						required: "Pole wymagane!",
						pattern: {
							value: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
							message: "Niepoprawny adres e-mail!",
						},
					})}
					error={errors.email?.message}
					icon={<EnvelopeIcon className="w-5" />}
					autoFocus
				/>
				<PasswordInput
					size="md"
					label="Hasło"
					{...register("password", {
						required: "Pole wymagane!",
					})}
					error={errors.password?.message}
					icon={<LockClosedIcon className="w-5" />}
				/>

				<Group position="right" spacing="lg">
					<Button size="md" type="submit">
						{isSubmitting || (isSubmitSuccessful && !signInError) ? (
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
