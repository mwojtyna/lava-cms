"use client";

import {
	EnvelopeIcon,
	EyeIcon,
	EyeSlashIcon,
	LockClosedIcon,
	UserIcon,
	UserPlusIcon,
} from "@heroicons/react/24/outline";
import { Group, PasswordInput, Stack, TextInput, Title } from "@admin/src/components";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { trpc } from "@admin/src/utils/trpc";
import ThemeSwitch from "@admin/app/_components/ThemeSwitch";
import SubmitButton from "@admin/app/_components/SubmitButton";

export default function SignUpForm({ onSignUp }: { onSignUp?: () => void }) {
	const inputSchema = z
		.object({
			name: z.string().min(1),
			lastName: z.string().min(1),
			email: z
				.string()
				.min(1, { message: " " })
				.email({ message: "The e-mail you provided is invalid." }),
			password: z
				.string()
				.min(8, { message: "The password must be at least 8 characters long." })
				.regex(/[a-z]/, {
					message: "The password must contain at least one lowercase letter.",
				})
				.regex(/[A-Z]/, {
					message: "The password must contain at least one uppercase letter.",
				})
				.regex(/[0-9]/, {
					message: "The password must contain at least one digit.",
				}),
			repeatPassword: z.string(),
		})
		.refine((data) => data.password === data.repeatPassword && data.password !== "", {
			path: ["repeatPassword"],
			message: "The passwords do not match.",
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

		onSignUp?.();
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md">
			<Stack spacing="lg">
				<Title order={1} size="3.5rem" variant="gradient">
					Sign up
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
						label="Name"
						placeholder="Jan"
						{...register("name")}
						error={!!errors.name}
						icon={<UserIcon className="w-5" />}
					/>
					<TextInput
						size="md"
						type="text"
						label="Last name"
						placeholder="Kowalski"
						{...register("lastName")}
						error={!!errors.lastName}
					/>
				</Group>

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
				<PasswordInput
					size="md"
					label="Repeat password"
					{...register("repeatPassword")}
					error={errors.repeatPassword?.message}
					icon={<LockClosedIcon className="w-5" />}
					visibilityToggleIcon={({ reveal, size }) =>
						reveal ? (
							<EyeSlashIcon style={{ width: size }} />
						) : (
							<EyeIcon style={{ width: size }} />
						)
					}
				/>

				<Group position="apart">
					<ThemeSwitch />
					<SubmitButton
						size="md"
						leftIcon={
							!isSubmitting && !isSubmitSuccessful && <UserPlusIcon className="w-5" />
						}
						isLoading={isSubmitting || isSubmitSuccessful}
					>
						Sign up
					</SubmitButton>
				</Group>
			</Stack>
		</form>
	);
}
