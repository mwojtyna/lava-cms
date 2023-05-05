"use client";

import { EnvelopeIcon, LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { trpcReact } from "@admin/src/utils/trpcReact";
import { Button, Input } from "../../src/components/ui/client";
import { SinglePageForm } from "../../src/components/SinglePageForm";

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

export function SignUpForm() {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isSubmitSuccessful },
	} = useForm<Inputs>({ mode: "onSubmit", resolver: zodResolver(inputSchema) });
	const mutation = trpcReact.auth.signUp.useMutation();

	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		await mutation.mutateAsync({
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
	};

	return (
		<SinglePageForm
			onSubmit={handleSubmit(onSubmit)}
			className="my-auto w-full max-w-lg"
			titleText={
				<span className="bg-gradient-to-b from-foreground/75 to-foreground bg-clip-text text-transparent dark:bg-gradient-to-t">
					Add admin user
				</span>
			}
			submitButton={
				<Button
					type="submit"
					icon={<ArrowRightIcon className="w-5" />}
					className="ml-auto shadow-lg shadow-primary/25"
					loading={isSubmitting || isSubmitSuccessful}
				>
					Continue
				</Button>
			}
		>
			<Input
				type="email"
				label="E-mail"
				placeholder="user@domain.com"
				{...register("email")}
				error={errors.email?.message}
				icon={<EnvelopeIcon className="w-5" />}
				autoFocus
			/>

			<div className="flex gap-4">
				<Input
					type="text"
					label="Name"
					placeholder="Jan"
					{...register("name")}
					error={!!errors.name}
					icon={<UserIcon className="w-5" />}
				/>
				<Input
					type="text"
					label="Last name"
					placeholder="Kowalski"
					{...register("lastName")}
					error={!!errors.lastName}
				/>
			</div>

			<Input
				type="password"
				label="Password"
				{...register("password")}
				error={errors.password?.message}
				icon={<LockClosedIcon className="w-5" />}
			/>
			<Input
				type="password"
				label="Repeat password"
				{...register("repeatPassword")}
				error={errors.repeatPassword?.message}
				icon={<LockClosedIcon className="w-5" />}
			/>
		</SinglePageForm>
	);
}
