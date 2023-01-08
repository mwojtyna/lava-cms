"use client";

import {
	Button,
	Group,
	PasswordInput,
	Stack,
	TextInput,
	Title,
	UnstyledButton,
} from "@mantine/core";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { type SubmitHandler, useForm } from "react-hook-form";

function SignUpForm() {
	interface Inputs {
		email: string;
		name: string;
		lastName: string;
		password: string;
		repeatPassword: string;
	}

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<Inputs>({ mode: "onTouched" });
	const onSubmit: SubmitHandler<Inputs> = (data) => {
		signIn("credentials", {
			callbackUrl: "/admin/dashboard",
			...data,
		});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Stack spacing="lg" className="w-96">
				<Title order={1} size="3.5rem" variant="gradient">
					Zarejestruj się
				</Title>

				<TextInput
					size="md"
					type="email"
					label="E-mail"
					placeholder="user@domain.com"
					{...register("email", {
						required: true,
						pattern:
							/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
					})}
					error={errors.email && "Niepoprawny adres e-mail!"}
				/>

				<Group position="center" grow>
					<TextInput
						size="md"
						type="text"
						label="Imię"
						placeholder="Jan"
						{...register("name", {
							required: true,
						})}
						error={!!errors.name}
					/>
					<TextInput
						size="md"
						type="text"
						label="Nazwisko"
						placeholder="Kowalski"
						{...register("lastName", {
							required: true,
						})}
						error={!!errors.lastName}
					/>
				</Group>

				<PasswordInput
					size="md"
					label="Hasło"
					{...register("password", {
						required: true,
						pattern:
							/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
					})}
					error={
						errors.password &&
						"Hasło musi mieć minimum 8 znaków, jedną wielką literę, oraz jedną cyfrę!"
					}
				/>
				<PasswordInput
					size="md"
					label="Powtórz hasło"
					{...register("repeatPassword", {
						required: true,
						validate: (value) => value === watch("password"),
					})}
					error={errors.repeatPassword && "Hasła nie są identyczne!"}
				/>

				<Group position="right" spacing="lg">
					<UnstyledButton>
						<Link
							href="/admin/auth/signin"
							className="text-inherit no-underline hover:underline"
						>
							Mam już konto
						</Link>
					</UnstyledButton>

					<Button size="md" type="submit">
						Zarejestruj się
					</Button>
				</Group>
			</Stack>
		</form>
	);
}

export default SignUpForm;
