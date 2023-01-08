"use client";

import { Button, Group, TextInput, Title, UnstyledButton } from "@mantine/core";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { type SubmitHandler, useForm } from "react-hook-form";

function SignUpForm() {
	interface Inputs {
		email: string;
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
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="flex w-80 flex-col gap-4"
		>
			<Title order={1} variant="gradient">
				Zarejestruj się
			</Title>

			<TextInput
				size="md"
				type="email"
				label="E-mail"
				placeholder="user@domain.com"
				{...register("email", {
					required: true,
					pattern: /^\S+@\S+$/i,
				})}
				error={errors.email && "Niepoprawny adres e-mail!"}
			/>
			<TextInput
				size="md"
				type="password"
				label="Hasło"
				{...register("password", {
					required: true,
					pattern:
						/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
				})}
				error={
					errors.password &&
					"Hasło musi mieć minimum 8 znaków, jedną wielką literę, oraz jedną cyfrę!"
				}
			/>
			<TextInput
				size="md"
				type="password"
				label="Powtórz hasło"
				{...register("repeatPassword", {
					required: true,
					validate: (value) => value === watch("password"),
				})}
				error={errors.repeatPassword && "Hasła nie są identyczne!"}
			/>

			<Group position="apart">
				<UnstyledButton className="px-1">
					<Link
						href="/admin/auth/signin"
						className="text-inherit no-underline hover:underline"
					>
						Zaloguj się
					</Link>
				</UnstyledButton>
				<Button size="md" type="submit">
					Zarejestruj się
				</Button>
			</Group>
		</form>
	);
}

export default SignUpForm;
