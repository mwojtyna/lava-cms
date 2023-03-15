"use client";

import { EnvelopeIcon, LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";
import { Button, Group, Loader, PasswordInput, Stack, TextInput, Title } from "@mantine/core";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { trpc } from "@admin/src/utils/trpc";
import ThemeSwitch from "@admin/app/(components)/ThemeSwitch";

function SignUpForm() {
	const router = useRouter();

	const inputSchema = z
		.object({
			name: z.string().min(1, { message: "Imię jest wymagane" }),
			lastName: z.string().min(1, { message: "Nazwisko jest wymagane" }),
			email: z
				.string()
				.min(1, { message: "E-mail jest wymagany" })
				.email({ message: "Niepoprawny adres e-mail" }),
			password: z
				.string()
				.min(1, { message: "Hasło jest wymagane" })
				.min(8, { message: "Hasło musi zawierać przynajmniej 8 znaków" })
				.regex(/[a-z]/, { message: "Hasło musi zawierać przynajmniej jedną małą literę" })
				.regex(/[A-Z]/, { message: "Hasło musi zawierać przynajmniej jedną dużą literę" })
				.regex(/[0-9]/, { message: "Hasło musi zawierać przynajmniej jedną cyfrę" }),
			repeatPassword: z.string().min(1, { message: "Powtórzenie hasła jest wymagane" }),
		})
		.refine((data) => data.password === data.repeatPassword, {
			path: ["repeatPassword"],
			message: "Hasła nie są takie same",
		});
	type Inputs = z.infer<typeof inputSchema>;

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isSubmitSuccessful },
	} = useForm<Inputs>({ mode: "onSubmit", resolver: zodResolver(inputSchema) });

	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		await trpc.auth.signUp.mutate({
			name: data.name,
			lastName: data.lastName,
			email: data.email,
			password: data.password,
		});
		await signIn("credentials", {
			redirect: false,
			email: data.email,
			password: data.password,
		});

		router.push("/dashboard");
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
					{...register("email")}
					error={errors.email?.message}
					icon={<EnvelopeIcon className="w-5" />}
					autoFocus
				/>

				<Group position="center" align="flex-start" grow>
					<TextInput
						size="md"
						type="text"
						label="Imię"
						placeholder="Jan"
						{...register("name")}
						error={errors.name?.message}
						icon={<UserIcon className="w-5" />}
					/>
					<TextInput
						size="md"
						type="text"
						label="Nazwisko"
						placeholder="Kowalski"
						{...register("lastName")}
						error={errors.lastName?.message}
					/>
				</Group>

				<PasswordInput
					size="md"
					label="Hasło"
					{...register("password")}
					error={errors.password?.message}
					icon={<LockClosedIcon className="w-5" />}
				/>
				<PasswordInput
					size="md"
					label="Powtórz hasło"
					{...register("repeatPassword")}
					error={errors.repeatPassword?.message}
					icon={<LockClosedIcon className="w-5" />}
				/>

				<Group position="apart">
					<ThemeSwitch />
					<Button size="md" type="submit">
						{isSubmitting || isSubmitSuccessful ? (
							<Loader variant="dots" color="#fff" />
						) : (
							<>Zarejestruj się</>
						)}
					</Button>
				</Group>
			</Stack>
		</form>
	);
}

export default SignUpForm;
