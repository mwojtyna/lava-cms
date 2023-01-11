"use client";

import {
	EnvelopeIcon,
	LockClosedIcon,
	UserIcon,
} from "@heroicons/react/24/outline";
import {
	Button,
	Group,
	PasswordInput,
	Stack,
	TextInput,
	Title,
} from "@mantine/core";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { signUp } from "./signUp";
import type { User } from "api/prisma/types";
import { signIn } from "next-auth/react";

function SignUpForm() {
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<User & { repeatPassword: string }>({ mode: "onTouched" });
	const onSubmit: SubmitHandler<User> = async (data) => {
		await signUp(data);
		await signIn("credentials", {
			redirect: false,
			email: data.email,
			password: data.password,
		});

		router.push("/admin/dashboard", {
			forceOptimisticNavigation: true,
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
						required: "Pole wymagane!",
						pattern: {
							value: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
							message: "Niepoprawny adres e-mail!",
						},
					})}
					error={errors.email?.message}
					icon={<EnvelopeIcon className="w-5" />}
				/>

				<Group position="center" align="flex-start" grow>
					<TextInput
						size="md"
						type="text"
						label="Imię"
						placeholder="Jan"
						{...register("name", {
							required: "Pole wymagane!",
						})}
						error={errors.name?.message}
						icon={<UserIcon className="w-5" />}
					/>
					<TextInput
						size="md"
						type="text"
						label="Nazwisko"
						placeholder="Kowalski"
						{...register("last_name", {
							required: "Pole wymagane!",
						})}
						error={errors.last_name?.message}
					/>
				</Group>

				<PasswordInput
					size="md"
					label="Hasło"
					{...register("password", {
						required: "Pole wymagane!",
						pattern: {
							value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
							message:
								"Hasło musi mieć minimum 8 znaków, jedną wielką literę, oraz jedną cyfrę!",
						},
					})}
					error={errors.password?.message}
					icon={<LockClosedIcon className="w-5" />}
				/>
				<PasswordInput
					size="md"
					label="Powtórz hasło"
					{...register("repeatPassword", {
						required: "Pole wymagane!",
						validate: (value) =>
							value === watch("password")
								? true
								: "Hasła nie są identyczne!",
					})}
					error={errors.repeatPassword?.message}
					icon={<LockClosedIcon className="w-5" />}
				/>

				<Group position="right">
					<Button size="md" type="submit">
						Zarejestruj się
					</Button>
				</Group>
			</Stack>
		</form>
	);
}

export default SignUpForm;
